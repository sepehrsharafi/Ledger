"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createEntity,
  deleteEntity,
  fetchCollection,
  fetchJson,
  fetchRecord,
  updateEntity,
} from "@/lib/apiClient";
import { createEmptyStore, createStoreFromSnapshot } from "@/lib/storeAdapter";
import { groupBy } from "@/lib/utils";

const MODULE_PROJECT_CACHE = new Map();
let appShellCache = null;
let appShellPromise = null;

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function getCurrentUser(store) {
  return (
    store.teamMembers.find((member) => member.name === "Alex Morgan") ||
    store.teamMembers[0] || { name: "Alex Morgan" }
  );
}

function normalizeProjectUpdates(updates) {
  const next = { ...updates };
  if ("createdDate" in next) {
    next.createdAt = next.createdDate;
    delete next.createdDate;
  }
  return next;
}

function normalizeLeadUpdates(updates) {
  const next = { ...updates };
  if ("lastContactedDate" in next) {
    next.lastContactedAt = next.lastContactedDate;
    delete next.lastContactedDate;
  }
  if ("createdDate" in next) {
    next.createdAt = next.createdDate;
    delete next.createdDate;
  }
  return next;
}

function getAssignmentConflict(store, projectId, memberId) {
  const member = store.teamMembers.find((item) => item.id === memberId);
  if (!member) {
    return null;
  }

  const assignedTasks = store.tasks.filter(
    (task) => task.projectId === projectId && task.assignee === member.name,
  );

  if (!assignedTasks.length) {
    return null;
  }

  return {
    member,
    assignedTasks,
    taskCount: assignedTasks.length,
  };
}

function createProjectSelectors(store) {
  const leadsByProject = groupBy(store.leads, "projectId");
  const tasksByProject = groupBy(store.tasks, "projectId");
  const campaignsByProject = groupBy(store.campaigns, "projectId");
  const approvalsByProject = groupBy(store.approvals, "projectId");
  const eventsByProject = groupBy(store.calendarEvents, "projectId");
  const reportByProject = Object.fromEntries(
    store.reportConfigs.map((item) => [item.projectId, item]),
  );

  return {
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
  };
}

function createStoreFromCollections({ project, ...collections }) {
  return createStoreFromSnapshot({
    projects: project ? [project] : [],
    projectMembers: [],
    teamMembers: [],
    kpiSnapshots: [],
    timeSeries: [],
    channelBreakdowns: [],
    timelineAnnotations: [],
    goals: [],
    leads: [],
    leadActivities: [],
    campaigns: [],
    tasks: [],
    calendarEvents: [],
    approvals: [],
    approvalComments: [],
    reportConfigs: [],
    reportRecipients: [],
    agencySettings: null,
    ...collections,
  });
}

function useRemoteStore(loader, deps) {
  const [store, setStore] = useState(createEmptyStore);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function refresh() {
    setIsLoading(true);
    try {
      const nextStore = await loader();
      setStore(nextStore);
      setError(null);
      return nextStore;
    } catch (nextError) {
      setError(nextError);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    loader()
      .then((nextStore) => {
        if (!active) {
          return;
        }
        setStore(nextStore);
        setError(null);
      })
      .catch((nextError) => {
        if (active) {
          setError(nextError);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, deps);

  return {
    store,
    isLoading,
    error,
    refresh,
  };
}

export function useShellData() {
  const [data, setData] = useState(
    appShellCache || {
      projects: [],
      teamMembers: [],
      projectMembers: [],
      unreadCount: 0,
    },
  );
  const [isLoading, setIsLoading] = useState(!appShellCache);

  useEffect(() => {
    let active = true;

    if (appShellCache) {
      setData(appShellCache);
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    if (!appShellPromise) {
      appShellPromise = fetchJson("/api/app-shell").then((payload) => {
        appShellCache = payload;
        return payload;
      });
    }

    setIsLoading(true);
    appShellPromise
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    ...data,
    isLoading,
  };
}

export function useProjectsHubData() {
  const remote = useRemoteStore(async () => {
    const [projects, leads, campaigns, tasks, teamMembers, projectMembers] =
      await Promise.all([
        fetchCollection("projects"),
        fetchCollection("leads"),
        fetchCollection("campaigns"),
        fetchCollection("tasks"),
        fetchCollection("teamMembers"),
        fetchCollection("projectMembers"),
      ]);

    return createStoreFromCollections({
      projects,
      leads,
      campaigns,
      tasks,
      teamMembers,
      projectMembers,
    });
  }, []);

  const projectCards = useMemo(() => {
    const leadsByProject = groupBy(remote.store.leads, "projectId");
    const tasksByProject = groupBy(remote.store.tasks, "projectId");
    const campaignsByProject = groupBy(remote.store.campaigns, "projectId");

    return remote.store.projects.map((project) => ({
      ...project,
      leadCount: (leadsByProject[project.id] || []).length,
      campaignCount: (campaignsByProject[project.id] || []).length,
      taskCount: (tasksByProject[project.id] || []).length,
      teamCount: remote.store.teamMembers.filter((member) =>
        member.assignedProjectIds.includes(project.id),
      ).length,
    }));
  }, [remote.store]);

  async function addProject(projectInput) {
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

    await remote.refresh();
    return project.id;
  }

  return {
    ...remote,
    projectCards,
    addProject,
  };
}

export function useTeamPageData() {
  const remote = useRemoteStore(async () => {
    const [projects, teamMembers, projectMembers, tasks] = await Promise.all([
      fetchCollection("projects"),
      fetchCollection("teamMembers"),
      fetchCollection("projectMembers"),
      fetchCollection("tasks"),
    ]);

    return createStoreFromCollections({
      projects,
      teamMembers,
      projectMembers,
      tasks,
    });
  }, []);

  async function toggleTeamMemberAssignment(projectId, memberId, options = {}) {
    const member = remote.store.teamMembers.find((item) => item.id === memberId);
    if (!member) {
      return { status: "missing-member" };
    }

    const recordId = `${projectId}__${memberId}`;
    if (member.assignedProjectIds.includes(projectId)) {
      const conflict = getAssignmentConflict(remote.store, projectId, memberId);
      if (conflict && !options.force) {
        return {
          status: "requires-confirmation",
          ...conflict,
        };
      }

      await deleteEntity("projectMembers", recordId);
    } else {
      await createEntity("projectMembers", { projectId, memberId });
    }

    await remote.refresh();
    return { status: "updated" };
  }

  return {
    ...remote,
    toggleTeamMemberAssignment,
  };
}

export function useSettingsData() {
  const remote = useRemoteStore(async () => {
    const agencySettings = await fetchRecord("agencySettings", "agency");
    return createStoreFromCollections({ agencySettings });
  }, []);

  async function toggleIntegration(integrationId) {
    const settings = remote.store.agencySettings;
    await updateEntity("agencySettings", "agency", {
      integrations: settings.integrations.map((item) =>
        item.id === integrationId
          ? { ...item, connected: !item.connected }
          : item,
      ),
    });
    await remote.refresh();
  }

  async function toggleNotification(key) {
    const settings = remote.store.agencySettings;
    await updateEntity("agencySettings", "agency", {
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
    await remote.refresh();
  }

  return {
    ...remote,
    toggleIntegration,
    toggleNotification,
  };
}

export function useProjectShellData(projectId, enabled = true) {
  const initialProject = MODULE_PROJECT_CACHE.get(projectId) || null;
  const [project, setProject] = useState(initialProject);
  const [isLoading, setIsLoading] = useState(enabled && !initialProject);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return () => {};
    }

    let active = true;
    const cachedProject = MODULE_PROJECT_CACHE.get(projectId) || null;

    if (cachedProject) {
      setProject(cachedProject);
      setIsLoading(false);
    } else {
      setProject(null);
      setIsLoading(true);
    }

    fetchJson(`/api/projects/${projectId}/shell`)
      .then((payload) => {
        if (!active) {
          return;
        }
        MODULE_PROJECT_CACHE.set(projectId, payload.project);
        setProject(payload.project);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled, projectId]);

  return {
    project,
    isLoading,
  };
}

export function useProjectOverviewData(projectId, enabled = true) {
  const [data, setData] = useState({
    bundle: null,
    recentActivity: [],
    teamMembers: [],
  });
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return () => {};
    }

    let active = true;

    setIsLoading(true);
    fetchJson(`/api/projects/${projectId}/overview`)
      .then((payload) => {
        if (!active) {
          return;
        }
        MODULE_PROJECT_CACHE.set(projectId, payload.project);
        setData({
          bundle: payload.bundle,
          recentActivity: payload.recentActivity,
          teamMembers: payload.teamMembers,
        });
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled, projectId]);

  return {
    ...data,
    isLoading,
  };
}

export function useProjectLeadsData(projectId, enabled = true) {
  const [summaryData, setSummaryData] = useState({
    project: MODULE_PROJECT_CACHE.get(projectId) || null,
    summary: {
      total: 0,
      statusCounts: {},
      conversionRate: 0,
    },
    filters: {
      sources: [],
      assignedPeople: [],
    },
    teamMembers: [],
  });
  const [listState, setListState] = useState({
    records: [],
    isLoading: true,
    q: "",
    status: "All",
    source: "All",
    assignee: "All",
  });
  const [detailState, setDetailState] = useState({
    lead: null,
    isLoading: false,
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(enabled);

  async function refreshSummary() {
    const payload = await fetchJson(`/api/projects/${projectId}/leads/summary`);
    MODULE_PROJECT_CACHE.set(projectId, payload.project);
    setSummaryData(payload);
    return payload;
  }

  async function refreshList(nextFilters = {}) {
    const mergedFilters = {
      q: nextFilters.q ?? listState.q,
      status: nextFilters.status ?? listState.status,
      source: nextFilters.source ?? listState.source,
      assignee: nextFilters.assignee ?? listState.assignee,
    };
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(mergedFilters)) {
      if (value && value !== "All") {
        searchParams.set(key, value);
      }
    }

    const query = searchParams.toString();
    const payload = await fetchJson(
      `/api/projects/${projectId}/leads${query ? `?${query}` : ""}`,
    );
    setListState((current) => ({
      ...current,
      ...mergedFilters,
      records: payload.records,
      isLoading: false,
    }));
    return payload.records;
  }

  async function openLead(leadId) {
    setDetailState({ lead: detailState.lead, isLoading: true });
    const payload = await fetchJson(`/api/projects/${projectId}/leads/${leadId}`);
    setDetailState({ lead: payload.lead, isLoading: false });
    return payload.lead;
  }

  useEffect(() => {
    if (!enabled) {
      setIsSummaryLoading(false);
      return () => {};
    }

    let active = true;

    setIsSummaryLoading(true);
    refreshSummary()
      .catch(() => {})
      .finally(() => {
        if (active) {
          setIsSummaryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled, projectId]);

  useEffect(() => {
    if (!enabled) {
      setListState((current) => ({ ...current, isLoading: false }));
      return () => {};
    }

    let active = true;
    setListState((current) => ({ ...current, isLoading: true }));
    refreshList().catch(() => {
      if (active) {
        setListState((current) => ({ ...current, isLoading: false }));
      }
    });

    return () => {
      active = false;
    };
  }, [enabled, projectId, listState.q, listState.status, listState.source, listState.assignee]);

  async function syncAfterMutation(leadId = null) {
    await Promise.all([refreshSummary(), refreshList()]);
    if (leadId) {
      return openLead(leadId);
    }
    setDetailState({ lead: null, isLoading: false });
    return null;
  }

  async function updateLeadStatus(leadId, status) {
    await updateEntity("leads", leadId, {
      status,
      lastContactedAt: new Date().toISOString().slice(0, 10),
    });
    await createEntity("leadActivities", {
      id: makeId("activity"),
      leadId,
      projectId,
      activityType: "Status change",
      content: `Lead moved to ${status}.`,
      author:
        summaryData.teamMembers.find((member) => member.name === "Alex Morgan")?.name ||
        summaryData.teamMembers[0]?.name ||
        "Alex Morgan",
    });
    return syncAfterMutation(leadId);
  }

  async function createLead(targetProjectId, payload) {
    const leadId = makeId("lead");
    const estimatedValue = String(payload.estimatedValue || "").trim()
      ? Number(payload.estimatedValue)
      : null;
    const nextLead = await createEntity("leads", {
      id: leadId,
      projectId: targetProjectId,
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
      projectId: targetProjectId,
      activityType: "Lead created",
      content: `${nextLead.name} was added to the pipeline.`,
      author:
        summaryData.teamMembers.find((member) => member.name === "Alex Morgan")?.name ||
        summaryData.teamMembers[0]?.name ||
        "Alex Morgan",
    });
    await Promise.all([refreshSummary(), refreshList()]);
  }

  async function updateLead(leadId, updates) {
    await updateEntity("leads", leadId, normalizeLeadUpdates(updates));
    return syncAfterMutation(leadId);
  }

  async function deleteLead(leadId) {
    await deleteEntity("leads", leadId);
    return syncAfterMutation(null);
  }

  async function addLeadNote(leadId, note) {
    if (!note.trim()) {
      return detailState.lead;
    }

    await createEntity("leadActivities", {
      id: makeId("activity"),
      leadId,
      projectId,
      activityType: "Timeline update",
      content: note.trim(),
      author:
        summaryData.teamMembers.find((member) => member.name === "Alex Morgan")?.name ||
        summaryData.teamMembers[0]?.name ||
        "Alex Morgan",
    });
    return syncAfterMutation(leadId);
  }

  return {
    project: summaryData.project,
    summary: summaryData.summary,
    filters: summaryData.filters,
    teamMembers: summaryData.teamMembers,
    leads: listState.records,
    isSummaryLoading,
    isListLoading: listState.isLoading,
    selectedLead: detailState.lead,
    isLeadDetailLoading: detailState.isLoading,
    query: listState.q,
    statusFilter: listState.status,
    sourceFilter: listState.source,
    assigneeFilter: listState.assignee,
    setQuery(q) {
      setListState((current) => ({ ...current, q }));
    },
    setStatusFilter(status) {
      setListState((current) => ({ ...current, status }));
    },
    setSourceFilter(source) {
      setListState((current) => ({ ...current, source }));
    },
    setAssigneeFilter(assignee) {
      setListState((current) => ({ ...current, assignee }));
    },
    openLead,
    closeLead() {
      setDetailState({ lead: null, isLoading: false });
    },
    updateLeadStatus,
    createLead,
    updateLead,
    deleteLead,
    addLeadNote,
  };
}

export function useProjectModuleData(projectId, module) {
  const remote = useRemoteStore(async () => {
    if (module === "overview" || module === "leads") {
      return createEmptyStore();
    }

    const payload = await fetchJson(`/api/projects/${projectId}/modules/${module}`);
    return createStoreFromSnapshot(payload.seed);
  }, [projectId, module]);

  const selectors = useMemo(
    () => createProjectSelectors(remote.store),
    [remote.store],
  );

  async function refresh() {
    await remote.refresh();
  }

  async function updateLeadStatus(leadId, status) {
    const lead = remote.store.leads.find((item) => item.id === leadId);
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
      author: getCurrentUser(remote.store).name,
    });
    await refresh();
  }

  async function createLead(targetProjectId, payload) {
    const leadId = makeId("lead");
    const estimatedValue = String(payload.estimatedValue || "").trim()
      ? Number(payload.estimatedValue)
      : null;
    const nextLead = await createEntity("leads", {
      id: leadId,
      projectId: targetProjectId,
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
      projectId: targetProjectId,
      activityType: "Lead created",
      content: `${nextLead.name} was added to the pipeline.`,
      author: getCurrentUser(remote.store).name,
    });

    await refresh();
  }

  async function updateLead(leadId, updates) {
    await updateEntity("leads", leadId, normalizeLeadUpdates(updates));
    await refresh();
  }

  async function deleteLead(leadId) {
    await deleteEntity("leads", leadId);
    await refresh();
  }

  async function addLeadNote(leadId, note) {
    const lead = remote.store.leads.find((item) => item.id === leadId);
    if (!lead || !note.trim()) {
      return;
    }

    await createEntity("leadActivities", {
      id: makeId("activity"),
      leadId,
      projectId: lead.projectId,
      activityType: "Timeline update",
      content: note.trim(),
      author: getCurrentUser(remote.store).name,
    });

    await refresh();
  }

  async function updateTaskColumn(taskId, column) {
    await updateEntity("tasks", taskId, { column });
    await refresh();
  }

  async function createTask(targetProjectId, payload) {
    await createEntity("tasks", {
      id: makeId("task"),
      projectId: targetProjectId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      column: payload.column,
      assignee: payload.assignee,
      dueDate: payload.dueDate,
      priority: payload.priority,
      notes: payload.notes?.trim() || "",
    });

    await refresh();
  }

  async function updateTask(taskId, updates) {
    await updateEntity("tasks", taskId, updates);
    await refresh();
  }

  async function deleteTask(taskId) {
    await deleteEntity("tasks", taskId);
    await refresh();
  }

  async function updateApprovalStatus(approvalId, status) {
    await updateEntity("approvals", approvalId, { status });
    await refresh();
  }

  async function addApprovalComment(approvalId, message) {
    if (!message.trim()) {
      return;
    }

    await createEntity("approvalComments", {
      id: makeId("comment"),
      approvalId,
      author: getCurrentUser(remote.store).name,
      message: message.trim(),
    });

    await refresh();
  }

  async function createApproval(targetProjectId, payload) {
    await createEntity("approvals", {
      id: makeId("approval"),
      projectId: targetProjectId,
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

    await refresh();
  }

  async function deleteApproval(approvalId) {
    await deleteEntity("approvals", approvalId);
    await refresh();
  }

  async function updateReportConfig(targetProjectId, updater) {
    const current = remote.store.reportConfigs.find(
      (config) => config.projectId === targetProjectId,
    );
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

    await refresh();
  }

  async function updateProject(targetProjectId, updates) {
    await updateEntity("projects", targetProjectId, normalizeProjectUpdates(updates));
    await refresh();
  }

  async function createCampaign(targetProjectId, payload) {
    await createEntity("campaigns", {
      id: makeId("campaign"),
      projectId: targetProjectId,
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
      owner: payload.owner || getCurrentUser(remote.store).name,
      notes: payload.notes?.trim() || "",
    });

    await refresh();
  }

  async function updateCampaign(campaignId, updates) {
    await updateEntity("campaigns", campaignId, updates);
    await refresh();
  }

  async function deleteCampaign(campaignId) {
    await deleteEntity("campaigns", campaignId);
    await refresh();
  }

  async function createCalendarEvent(targetProjectId, payload) {
    await createEntity("calendarEvents", {
      id: makeId("event"),
      projectId: targetProjectId,
      title: payload.title.trim(),
      channel: payload.channel,
      date: payload.date,
      status: payload.status,
      assignee: payload.assignee,
    });

    await refresh();
  }

  async function updateCalendarEvent(eventId, updates) {
    await updateEntity("calendarEvents", eventId, updates);
    await refresh();
  }

  async function deleteCalendarEvent(eventId) {
    await deleteEntity("calendarEvents", eventId);
    await refresh();
  }

  async function toggleTeamMemberAssignment(
    targetProjectId,
    memberId,
    options = {},
  ) {
    const member = remote.store.teamMembers.find((item) => item.id === memberId);
    if (!member) {
      return { status: "missing-member" };
    }

    const recordId = `${targetProjectId}__${memberId}`;
    if (member.assignedProjectIds.includes(targetProjectId)) {
      const conflict = getAssignmentConflict(
        remote.store,
        targetProjectId,
        memberId,
      );
      if (conflict && !options.force) {
        return {
          status: "requires-confirmation",
          ...conflict,
        };
      }

      await deleteEntity("projectMembers", recordId);
    } else {
      await createEntity("projectMembers", {
        projectId: targetProjectId,
        memberId,
      });
    }

    await refresh();
    return { status: "updated" };
  }

  return {
    ...remote,
    selectors,
    updateLeadStatus,
    createLead,
    updateLead,
    deleteLead,
    addLeadNote,
    updateTaskColumn,
    createTask,
    updateTask,
    deleteTask,
    updateApprovalStatus,
    addApprovalComment,
    deleteApproval,
    updateReportConfig,
    updateProject,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    createApproval,
    toggleTeamMemberAssignment,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  };
}
