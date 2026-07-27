import {
  getCollectionRecords,
  getGroupedCounts,
  getRecord,
} from "./postgres-store.js";

function notFound(message = "Project not found") {
  const error = new Error(message);
  error.status = 404;
  throw error;
}

function toProject(project) {
  if (!project) {
    return null;
  }

  return {
    ...project,
    createdDate: project.createdAt,
  };
}

function toLead(lead) {
  return {
    ...lead,
    createdDate: lead.createdAt,
    lastContactedDate: lead.lastContactedAt,
  };
}

function toActivity(activity) {
  return {
    ...activity,
    timestamp: activity.createdAt,
  };
}

function toApproval(approval, commentsByApprovalId) {
  return {
    ...approval,
    submittedDate: approval.submittedAt,
    comments: (commentsByApprovalId[approval.id] || []).map((comment) => ({
      ...comment,
      timestamp: comment.createdAt,
    })),
  };
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const groupKey = item[key];
    acc[groupKey] = acc[groupKey] || [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}

function mapKpis(rows) {
  const kpis = {};
  for (const row of rows) {
    kpis[row.metric] = {
      current: row.current,
      previous: row.previous,
      sparkline: row.sparkline,
    };
  }
  return kpis;
}

async function requireProject(projectId) {
  const project = await getRecord("projects", projectId);
  if (!project) {
    notFound();
  }
  return project;
}

export async function getProjectShell(projectId) {
  const project = await requireProject(projectId);
  return { project: toProject(project) };
}

export async function getAppShellView() {
  const [
    projects,
    teamMembers,
    projectMembers,
    approvals,
    reviewTasks,
    leadCounts,
    campaignCounts,
    taskCounts,
    pendingApprovalCounts,
  ] = await Promise.all([
    getCollectionRecords("projects"),
    getCollectionRecords("teamMembers"),
    getCollectionRecords("projectMembers"),
    getCollectionRecords("approvals", { status: "Pending" }),
    getCollectionRecords("tasks", { column: "Review" }),
    getGroupedCounts("leads", "projectId"),
    getGroupedCounts("campaigns", "projectId"),
    getGroupedCounts("tasks", "projectId"),
    getGroupedCounts("approvals", "projectId", { status: "Pending" }),
  ]);

  return {
    projects: projects.map(toProject),
    teamMembers,
    projectMembers,
    unreadCount: approvals.length + reviewTasks.length,
    // Per-project tallies for the sidebar badges, keyed by project id.
    navCounts: Object.fromEntries(
      projects.map((project) => [
        project.id,
        {
          leads: leadCounts[project.id] || 0,
          campaigns: campaignCounts[project.id] || 0,
          tasks: taskCounts[project.id] || 0,
          approvals: pendingApprovalCounts[project.id] || 0,
        },
      ]),
    ),
  };
}

export async function getProjectOverviewView(projectId) {
  const project = await requireProject(projectId);
  const [
    kpiSnapshots,
    timeSeries,
    channelBreakdowns,
    goals,
    leadRecords,
    campaigns,
    tasks,
    leadActivities,
    teamMembers,
  ] = await Promise.all([
    getCollectionRecords("kpiSnapshots", { projectId }),
    getCollectionRecords("timeSeries", { projectId }),
    getCollectionRecords("channelBreakdowns", { projectId }),
    getCollectionRecords("goals", { projectId }),
    getCollectionRecords("leads", { projectId }),
    getCollectionRecords("campaigns", { projectId }),
    getCollectionRecords("tasks", { projectId }),
    getCollectionRecords("leadActivities", { projectId }),
    getCollectionRecords("teamMembers"),
  ]);

  return {
    project: toProject(project),
    bundle: {
      project: toProject(project),
      kpis: mapKpis(kpiSnapshots),
      series: timeSeries.map(({ id, projectId: _projectId, ...item }) => item),
      channels: channelBreakdowns.map(({ id, projectId: _projectId, ...item }) => item),
      goals: goals.map(({ id, projectId: _projectId, ...item }) => item),
      leads: leadRecords.map(toLead),
      campaigns,
      tasks,
      leadCount: leadRecords.length,
      topCampaigns: campaigns
        .slice()
        .sort((a, b) => Number(b.conversions) - Number(a.conversions))
        .slice(0, 4),
      upcomingTasks: tasks
        .slice()
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 6),
    },
    recentActivity: leadActivities
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(toActivity),
    teamMembers,
  };
}

export async function getProjectLeadsSummaryView(projectId) {
  const project = await requireProject(projectId);
  const [leadRecords, teamMembers] = await Promise.all([
    getCollectionRecords("leads", { projectId }),
    getCollectionRecords("teamMembers"),
  ]);

  const statusCounts = leadRecords.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});
  const wonCount = statusCounts.Won || 0;

  return {
    project: toProject(project),
    summary: {
      total: leadRecords.length,
      statusCounts,
      conversionRate: leadRecords.length ? (wonCount / leadRecords.length) * 100 : 0,
    },
    filters: {
      sources: [...new Set(leadRecords.map((lead) => lead.source))].sort(),
      assignedPeople: teamMembers.map((member) => member.name),
    },
    teamMembers,
  };
}

export async function getProjectLeadsListView(projectId, filters = {}) {
  await requireProject(projectId);

  const records = (await getCollectionRecords("leads", { projectId }))
    .filter((lead) => {
      const query = String(filters.q || "").trim().toLowerCase();
      const matchesQuery =
        !query ||
        [lead.name, lead.company, lead.email].join(" ").toLowerCase().includes(query);
      const matchesStatus = !filters.status || filters.status === "All" || lead.status === filters.status;
      const matchesSource = !filters.source || filters.source === "All" || lead.source === filters.source;
      const matchesAssignee =
        !filters.assignee ||
        filters.assignee === "All" ||
        lead.assignedTeamMember === filters.assignee;

      return matchesQuery && matchesStatus && matchesSource && matchesAssignee;
    })
    .map(toLead);

  return { records };
}

export async function getProjectLeadDetailView(projectId, leadId) {
  await requireProject(projectId);

  const lead = await getRecord("leads", leadId);
  if (!lead || lead.projectId !== projectId) {
    notFound("Lead not found");
  }

  const activities = (await getCollectionRecords("leadActivities", { projectId }))
    .filter((activity) => activity.leadId === leadId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(toActivity);

  return {
    lead: {
      ...toLead(lead),
      activities,
    },
  };
}

export async function getProjectModuleSnapshot(projectId, module) {
  const project = await requireProject(projectId);

  if (module === "campaigns") {
    return {
      seed: {
        projects: [project],
        campaigns: await getCollectionRecords("campaigns", { projectId }),
      },
    };
  }

  if (module === "calendar") {
    const [calendarEvents, teamMembers] = await Promise.all([
      getCollectionRecords("calendarEvents", { projectId }),
      getCollectionRecords("teamMembers"),
    ]);

    return {
      seed: {
        projects: [project],
        calendarEvents,
        teamMembers,
      },
    };
  }

  if (module === "tasks") {
    const [tasks, teamMembers] = await Promise.all([
      getCollectionRecords("tasks", { projectId }),
      getCollectionRecords("teamMembers"),
    ]);

    return {
      seed: {
        projects: [project],
        tasks,
        teamMembers,
      },
    };
  }

  if (module === "team" || module === "project-settings") {
    const [teamMembers, projectMembers] = await Promise.all([
      getCollectionRecords("teamMembers"),
      getCollectionRecords("projectMembers", { projectId }),
    ]);

    return {
      seed: {
        projects: [project],
        teamMembers,
        projectMembers,
      },
    };
  }

  if (module === "approvals") {
    const [approvals, approvalComments, teamMembers] = await Promise.all([
      getCollectionRecords("approvals", { projectId }),
      getCollectionRecords("approvalComments"),
      getCollectionRecords("teamMembers"),
    ]);
    const approvalIds = approvals.map((item) => item.id);

    return {
      seed: {
        projects: [project],
        approvals,
        approvalComments: approvalComments.filter((item) =>
          approvalIds.includes(item.approvalId),
        ),
        teamMembers,
      },
    };
  }

  if (module === "reports") {
    const reportConfigs = await getCollectionRecords("reportConfigs", { projectId });
    const reportConfigIds = reportConfigs.map((item) => item.id);

    return {
      seed: {
        projects: [project],
        reportConfigs,
        reportRecipients: (await getCollectionRecords("reportRecipients")).filter((item) =>
          reportConfigIds.includes(item.reportConfigId),
        ),
      },
    };
  }

  if (module === "client-view") {
    return {
      seed: {
        projects: [project],
        kpiSnapshots: await getCollectionRecords("kpiSnapshots", { projectId }),
        timeSeries: await getCollectionRecords("timeSeries", { projectId }),
        goals: await getCollectionRecords("goals", { projectId }),
      },
    };
  }

  const error = new Error("Unknown module");
  error.status = 404;
  throw error;
}
