"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { createInitialData } from "@/data/mockData";
import { groupBy, sum } from "@/lib/utils";

const AppContext = createContext(null);

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewerRole, setViewerRole] = useState("Admin");
  const [store, setStore] = useState(createInitialData);

  const selectors = useMemo(() => {
    const leadsByProject = groupBy(store.leads, "projectId");
    const tasksByProject = groupBy(store.tasks, "projectId");
    const campaignsByProject = groupBy(store.campaigns, "projectId");
    const approvalsByProject = groupBy(store.approvals, "projectId");
    const eventsByProject = groupBy(store.calendarEvents, "projectId");
    const reportByProject = Object.fromEntries(store.reportConfigs.map((item) => [item.projectId, item]));

    return {
      projectCards: store.projects.map((project) => ({
        ...project,
        leadCount: (leadsByProject[project.id] || []).length,
        campaignCount: (campaignsByProject[project.id] || []).length,
        taskCount: (tasksByProject[project.id] || []).length,
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
        return {
          total: projectLeads.length,
          statusCounts,
          conversionRate: projectLeads.length ? (won / projectLeads.length) * 100 : 0,
          pipelineValue: sum(projectLeads, (lead) => lead.estimatedValue),
        };
      },
    };
  }, [store]);

  const value = useMemo(() => ({
    isAuthenticated,
    viewerRole,
    store,
    selectors,
    login() {
      setIsAuthenticated(true);
    },
    logout() {
      setIsAuthenticated(false);
    },
    setViewerRole,
    addProject(projectInput) {
      const newProject = {
        id: makeId("project"),
        name: projectInput.name,
        clientName: projectInput.clientName,
        type: projectInput.type,
        brandPrimary: projectInput.brandPrimary,
        brandAccent: projectInput.brandAccent,
        status: "Active",
        createdDate: new Date().toISOString().slice(0, 10),
        topKpiLabel: "Top KPI",
        topKpiValue: "--",
      };

      setStore((current) => ({
        ...current,
        projects: [newProject, ...current.projects],
        kpiSnapshots: { ...current.kpiSnapshots, [newProject.id]: null },
        timeSeries: { ...current.timeSeries, [newProject.id]: [] },
        channelBreakdowns: { ...current.channelBreakdowns, [newProject.id]: [] },
        timelineAnnotations: { ...current.timelineAnnotations, [newProject.id]: [] },
        goals: { ...current.goals, [newProject.id]: [] },
        reportConfigs: [
          ...current.reportConfigs,
          {
            id: makeId("report"),
            projectId: newProject.id,
            includedSections: [],
            frequency: "Weekly",
            internalReviewFirst: true,
            recipients: [],
            lastSentDate: null,
            engagementStats: { opens: 0, downloads: 0, lastOpenedDate: null },
          },
        ],
      }));

      return newProject.id;
    },
    updateLeadStatus(leadId, status) {
      setStore((current) => ({
        ...current,
        leads: current.leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
        leadActivities: [
          {
            id: makeId("activity"),
            leadId,
            projectId: current.leads.find((lead) => lead.id === leadId)?.projectId,
            activityType: "Status change",
            content: `Lead moved to ${status}.`,
            author: "Alex Morgan",
            timestamp: new Date().toISOString(),
          },
          ...current.leadActivities,
        ],
      }));
    },
    createLead(projectId, payload) {
      const leadId = makeId("lead");
      const nextLead = {
        id: leadId,
        projectId,
        name: payload.name.trim(),
        email: payload.email.trim(),
        company: payload.company.trim() || "Individual Customer",
        phone: payload.phone.trim() || "+1-555-0100",
        source: payload.source,
        status: payload.status,
        estimatedValue: Number(payload.estimatedValue) || 0,
        capturedFrom: payload.capturedFrom.trim() || payload.source,
        assignedTeamMember: payload.assignedTeamMember,
        createdDate: new Date().toISOString().slice(0, 10),
        lastContactedDate: new Date().toISOString().slice(0, 10),
      };

      setStore((current) => ({
        ...current,
        leads: [nextLead, ...current.leads],
        leadActivities: [
          {
            id: makeId("activity"),
            leadId,
            projectId,
            activityType: "Lead created",
            content: `${nextLead.name} was added to the pipeline.`,
            author: "Alex Morgan",
            timestamp: new Date().toISOString(),
          },
          ...current.leadActivities,
        ],
      }));
    },
    updateLead(leadId, updates) {
      setStore((current) => ({
        ...current,
        leads: current.leads.map((lead) => (lead.id === leadId ? { ...lead, ...updates } : lead)),
      }));
    },
    markLeadContacted(leadId) {
      setStore((current) => ({
        ...current,
        leads: current.leads.map((lead) =>
          lead.id === leadId
            ? { ...lead, status: lead.status === "New" ? "Contacted" : lead.status, lastContactedDate: new Date().toISOString().slice(0, 10) }
            : lead
        ),
        leadActivities: [
          {
            id: makeId("activity"),
            leadId,
            projectId: current.leads.find((lead) => lead.id === leadId)?.projectId,
            activityType: "Call",
            content: "Lead marked as contacted.",
            author: "Alex Morgan",
            timestamp: new Date().toISOString(),
          },
          ...current.leadActivities,
        ],
      }));
    },
    addLeadNote(leadId, note) {
      const lead = store.leads.find((item) => item.id === leadId);
      if (!lead || !note.trim()) {
        return;
      }
      setStore((current) => ({
        ...current,
        leadActivities: [
          {
            id: makeId("activity"),
            leadId,
            projectId: lead.projectId,
            activityType: "Note",
            content: note.trim(),
            author: "Alex Morgan",
            timestamp: new Date().toISOString(),
          },
          ...current.leadActivities,
        ],
      }));
    },
    updateTaskColumn(taskId, column) {
      setStore((current) => ({
        ...current,
        tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, column } : task)),
      }));
    },
    createTask(projectId, payload) {
      setStore((current) => ({
        ...current,
        tasks: [
          {
            id: makeId("task"),
            projectId,
            title: payload.title.trim(),
            description: payload.description.trim(),
            column: payload.column,
            assignee: payload.assignee,
            dueDate: payload.dueDate,
            priority: payload.priority,
          },
          ...current.tasks,
        ],
      }));
    },
    updateTask(taskId, updates) {
      setStore((current) => ({
        ...current,
        tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
      }));
    },
    updateApprovalStatus(approvalId, status) {
      setStore((current) => ({
        ...current,
        approvals: current.approvals.map((approval) => (approval.id === approvalId ? { ...approval, status } : approval)),
      }));
    },
    addApprovalComment(approvalId, message) {
      if (!message.trim()) {
        return;
      }
      setStore((current) => ({
        ...current,
        approvals: current.approvals.map((approval) =>
          approval.id === approvalId
            ? {
                ...approval,
                comments: [
                  ...approval.comments,
                  {
                    id: makeId("comment"),
                    author: "Alex Morgan",
                    message: message.trim(),
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : approval
        ),
      }));
    },
    updateReportConfig(projectId, updater) {
      setStore((current) => ({
        ...current,
        reportConfigs: current.reportConfigs.map((config) =>
          config.projectId === projectId ? updater(config) : config
        ),
      }));
    },
    updateProject(projectId, updates) {
      setStore((current) => ({
        ...current,
        projects: current.projects.map((project) => (project.id === projectId ? { ...project, ...updates } : project)),
      }));
    },
    createCampaign(projectId, payload) {
      setStore((current) => ({
        ...current,
        campaigns: [
          {
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
          },
          ...current.campaigns,
        ],
      }));
    },
    updateCampaign(campaignId, updates) {
      setStore((current) => ({
        ...current,
        campaigns: current.campaigns.map((campaign) => (campaign.id === campaignId ? { ...campaign, ...updates } : campaign)),
      }));
    },
    createCalendarEvent(projectId, payload) {
      setStore((current) => ({
        ...current,
        calendarEvents: [
          {
            id: makeId("event"),
            projectId,
            title: payload.title.trim(),
            channel: payload.channel,
            date: payload.date,
            status: payload.status,
            assignee: payload.assignee,
          },
          ...current.calendarEvents,
        ],
      }));
    },
    updateCalendarEvent(eventId, updates) {
      setStore((current) => ({
        ...current,
        calendarEvents: current.calendarEvents.map((event) => (event.id === eventId ? { ...event, ...updates } : event)),
      }));
    },
    toggleIntegration(integrationId) {
      setStore((current) => ({
        ...current,
        agencySettings: {
          ...current.agencySettings,
          integrations: current.agencySettings.integrations.map((item) =>
            item.id === integrationId ? { ...item, connected: !item.connected } : item
          ),
        },
      }));
    },
    toggleNotification(key) {
      setStore((current) => ({
        ...current,
        agencySettings: {
          ...current.agencySettings,
          notifications: {
            ...current.agencySettings.notifications,
            [key]: !current.agencySettings.notifications[key],
          },
        },
      }));
    },
  }), [isAuthenticated, selectors, store, viewerRole]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}
