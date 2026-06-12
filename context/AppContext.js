"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createEntity,
  deleteEntity,
  fetchBootstrap,
  updateEntity,
} from "@/lib/apiClient";
import { createEmptyStore, createStoreFromSnapshot } from "@/lib/storeAdapter";
import { groupBy, sum } from "@/lib/utils";

const AppContext = createContext(null);

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function getCurrentUser(store) {
  return (
    store.teamMembers.find((member) => member.name === "Alex Morgan") ||
    store.teamMembers[0] || {
      name: "Alex Morgan",
    }
  );
}

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewerRole, setViewerRole] = useState("Admin");
  const [store, setStore] = useState(createEmptyStore);
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);

  async function refreshStore() {
    const snapshot = await fetchBootstrap();
    setStore(createStoreFromSnapshot(snapshot));
    setIsStoreHydrated(true);
    return snapshot;
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const snapshot = await fetchBootstrap();
        if (!active) {
          return;
        }
        setStore(createStoreFromSnapshot(snapshot));
      } finally {
        if (active) {
          setIsStoreHydrated(true);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const selectors = useMemo(() => {
    const leadsByProject = groupBy(store.leads, "projectId");
    const tasksByProject = groupBy(store.tasks, "projectId");
    const campaignsByProject = groupBy(store.campaigns, "projectId");
    const approvalsByProject = groupBy(store.approvals, "projectId");
    const eventsByProject = groupBy(store.calendarEvents, "projectId");
    const reportByProject = Object.fromEntries(
      store.reportConfigs.map((item) => [item.projectId, item])
    );

    return {
      projectCards: store.projects.map((project) => ({
        ...project,
        leadCount: (leadsByProject[project.id] || []).length,
        campaignCount: (campaignsByProject[project.id] || []).length,
        taskCount: (tasksByProject[project.id] || []).length,
        teamCount: store.teamMembers.filter((member) =>
          member.assignedProjectIds.includes(project.id)
        ).length,
      })),
      getProjectBundle(projectId) {
        return {
          project: store.projects.find((item) => item.id === projectId),
          kpis: store.kpiSnapshots[projectId],
          series: store.timeSeries[projectId] || [],
          channels: store.channelBreakdowns[projectId] || [],
          annotations: store.timelineAnnotations[projectId] || [],
          goals: store.goals[projectId] || [],
          leads: leadsByProject[projectId] || [],
          campaigns: campaignsByProject[projectId] || [],
          tasks: tasksByProject[projectId] || [],
          events: eventsByProject[projectId] || [],
          approvals: approvalsByProject[projectId] || [],
          activities: store.leadActivities
            .filter((item) => item.projectId === projectId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
          reportConfig: reportByProject[projectId] || null,
        };
      },
      getRecentProjectActivity(projectId, limit = 6) {
        return store.leadActivities
          .filter((item) => item.projectId === projectId)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);
      },
      getLeadActivities(leadId) {
        return store.leadActivities
          .filter((item) => item.leadId === leadId)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      },
      getLeadSummary(projectId) {
        const projectLeads = leadsByProject[projectId] || [];
        const statusCounts = projectLeads.reduce((acc, lead) => {
          acc[lead.status] = (acc[lead.status] || 0) + 1;
          return acc;
        }, {});
        const won = statusCounts.Won || 0;
        const pipelineValue = sum(
          projectLeads,
          (lead) => Number(lead.estimatedValue) || 0
        );
        return {
          total: projectLeads.length,
          statusCounts,
          conversionRate: projectLeads.length ? (won / projectLeads.length) * 100 : 0,
          pipelineValue,
        };
      },
    };
  }, [store]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      viewerRole,
      store,
      selectors,
      isStoreHydrated,
      login() {
        setIsAuthenticated(true);
      },
      logout() {
        setIsAuthenticated(false);
      },
      setViewerRole,
      refreshStore,
      async addProject(projectInput) {
        const project = await createEntity("projects", {
          name: projectInput.name,
          clientName: projectInput.clientName,
          type: projectInput.type,
          brandPrimary: projectInput.brandPrimary,
          brandAccent: projectInput.brandAccent,
          status: "Active",
          topKpiLabel: "Top KPI",
          topKpiValue: "--",
        });

        await createEntity("reportConfigs", {
          id: makeId("report"),
          projectId: project.id,
          includedSections: [],
          frequency: "Weekly",
          internalReviewFirst: true,
          lastSentAt: null,
          engagementStats: { opens: 0, downloads: 0, lastOpenedDate: null },
        });

        await refreshStore();
        return project.id;
      },
      async updateLeadStatus(leadId, status) {
        const lead = store.leads.find((item) => item.id === leadId);
        if (!lead) {
          return;
        }

        await updateEntity("leads", leadId, { status });
        await createEntity("leadActivities", {
          id: makeId("activity"),
          leadId,
          projectId: lead.projectId,
          activityType: "Status change",
          content: `Lead moved to ${status}.`,
          author: getCurrentUser(store).name,
        });
        await refreshStore();
      },
      async createLead(projectId, payload) {
        const leadId = makeId("lead");
        const estimatedValue = payload.estimatedValue.trim()
          ? Number(payload.estimatedValue)
          : null;
        const nextLead = await createEntity("leads", {
          id: leadId,
          projectId,
          name: payload.name.trim(),
          email: payload.email.trim(),
          company: payload.company.trim() || "Individual Customer",
          phone: payload.phone.trim() || "+1-555-0100",
          source: payload.source,
          status: payload.status,
          estimatedValue: Number.isFinite(estimatedValue) ? estimatedValue : null,
          capturedFrom: payload.capturedFrom.trim() || payload.source,
          assignedTeamMember: payload.assignedTeamMember,
        });

        await createEntity("leadActivities", {
          id: makeId("activity"),
          leadId: nextLead.id,
          projectId,
          activityType: "Lead created",
          content: `${nextLead.name} was added to the pipeline.`,
          author: getCurrentUser(store).name,
        });
        await refreshStore();
      },
      async updateLead(leadId, updates) {
        await updateEntity("leads", leadId, updates);
        await refreshStore();
      },
      async markLeadContacted(leadId) {
        const lead = store.leads.find((item) => item.id === leadId);
        if (!lead) {
          return;
        }

        await updateEntity("leads", leadId, {
          status: lead.status === "New" ? "Contacted" : lead.status,
          lastContactedAt: new Date().toISOString().slice(0, 10),
        });
        await createEntity("leadActivities", {
          id: makeId("activity"),
          leadId,
          projectId: lead.projectId,
          activityType: "Call",
          content: "Lead marked as contacted.",
          author: getCurrentUser(store).name,
        });
        await refreshStore();
      },
      async addLeadNote(leadId, note) {
        const lead = store.leads.find((item) => item.id === leadId);
        if (!lead || !note.trim()) {
          return;
        }

        await createEntity("leadActivities", {
          id: makeId("activity"),
          leadId,
          projectId: lead.projectId,
          activityType: "Note",
          content: note.trim(),
          author: getCurrentUser(store).name,
        });
        await refreshStore();
      },
      async updateTaskColumn(taskId, column) {
        await updateEntity("tasks", taskId, { column });
        await refreshStore();
      },
      async createTask(projectId, payload) {
        await createEntity("tasks", {
          id: makeId("task"),
          projectId,
          title: payload.title.trim(),
          description: payload.description.trim(),
          column: payload.column,
          assignee: payload.assignee,
          dueDate: payload.dueDate,
          priority: payload.priority,
          notes: payload.notes?.trim() || "",
        });
        await refreshStore();
      },
      async updateTask(taskId, updates) {
        await updateEntity("tasks", taskId, updates);
        await refreshStore();
      },
      async toggleTeamMemberAssignment(projectId, memberId) {
        const member = store.teamMembers.find((item) => item.id === memberId);
        if (!member) {
          return;
        }

        const recordId = `${projectId}__${memberId}`;
        if (member.assignedProjectIds.includes(projectId)) {
          await deleteEntity("projectMembers", recordId);
        } else {
          await createEntity("projectMembers", {
            projectId,
            memberId,
          });
        }
        await refreshStore();
      },
      async updateApprovalStatus(approvalId, status) {
        await updateEntity("approvals", approvalId, { status });
        await refreshStore();
      },
      async addApprovalComment(approvalId, message) {
        if (!message.trim()) {
          return;
        }

        await createEntity("approvalComments", {
          id: makeId("comment"),
          approvalId,
          author: getCurrentUser(store).name,
          message: message.trim(),
        });
        await refreshStore();
      },
      async createApproval(projectId, payload) {
        await createEntity("approvals", {
          id: makeId("approval"),
          projectId,
          title: payload.title.trim(),
          requestType: payload.requestType,
          type: payload.requestType,
          thumbnailColor: payload.thumbnailColor || "#CBD5E1",
          status: payload.status,
          submittedBy: payload.submittedBy,
          summary: payload.summary.trim(),
          details: payload.details.trim(),
          pros: payload.pros,
          cons: payload.cons,
          attachments: payload.attachments,
          recommendation: payload.recommendation.trim(),
        });
        await refreshStore();
      },
      async updateReportConfig(projectId, updater) {
        const current = store.reportConfigs.find((config) => config.projectId === projectId);
        if (!current) {
          return;
        }

        const next = updater(current);
        await updateEntity("reportConfigs", current.id, {
          includedSections: next.includedSections,
          frequency: next.frequency,
          internalReviewFirst: next.internalReviewFirst,
          lastSentAt: next.lastSentDate,
          engagementStats: next.engagementStats,
        });

        for (const email of current.recipients) {
          await deleteEntity("reportRecipients", `${current.id}__${email}`);
        }
        for (const email of next.recipients) {
          await createEntity("reportRecipients", {
            reportConfigId: current.id,
            email,
          });
        }

        await refreshStore();
      },
      async updateProject(projectId, updates) {
        const next = { ...updates };
        if ("createdDate" in next) {
          next.createdAt = next.createdDate;
          delete next.createdDate;
        }
        await updateEntity("projects", projectId, next);
        await refreshStore();
      },
      async createCampaign(projectId, payload) {
        await createEntity("campaigns", {
          id: makeId("campaign"),
          projectId,
          name: payload.name.trim(),
          channel: payload.channel,
          status: payload.status,
          startDate: payload.startDate,
          endDate: payload.endDate,
          budget: Number(payload.budget) || 0,
          spent: Number(payload.spent) || 0,
          impressions: Number(payload.impressions) || 0,
          clicks: Number(payload.clicks) || 0,
          conversions: Number(payload.conversions) || 0,
          owner: payload.owner || getCurrentUser(store).name,
          notes: payload.notes?.trim() || "",
        });
        await refreshStore();
      },
      async updateCampaign(campaignId, updates) {
        await updateEntity("campaigns", campaignId, updates);
        await refreshStore();
      },
      async createCalendarEvent(projectId, payload) {
        await createEntity("calendarEvents", {
          id: makeId("event"),
          projectId,
          title: payload.title.trim(),
          channel: payload.channel,
          date: payload.date,
          status: payload.status,
          assignee: payload.assignee,
        });
        await refreshStore();
      },
      async updateCalendarEvent(eventId, updates) {
        await updateEntity("calendarEvents", eventId, updates);
        await refreshStore();
      },
      async toggleIntegration(integrationId) {
        const settings = store.agencySettings;
        await updateEntity("agencySettings", "agency", {
          integrations: settings.integrations.map((item) =>
            item.id === integrationId
              ? { ...item, connected: !item.connected }
              : item
          ),
        });
        await refreshStore();
      },
      async toggleNotification(key) {
        const settings = store.agencySettings;
        await updateEntity("agencySettings", "agency", {
          notifications: {
            ...settings.notifications,
            [key]: !settings.notifications[key],
          },
        });
        await refreshStore();
      },
    }),
    [isAuthenticated, isStoreHydrated, selectors, store, viewerRole]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}
