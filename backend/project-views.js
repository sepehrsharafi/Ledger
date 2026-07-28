import {
  getCollectionRecords,
  getGroupedCounts,
  getProjectOverviewRows,
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

/**
 * The people who may be assigned work on a project — its roster, not the whole
 * agency. Every module that picks a person uses this, so a drawer can never offer
 * someone who is not on the project.
 */
async function getAssignedTeamMembers(projectId) {
  const [teamMembers, projectMembers] = await Promise.all([
    getCollectionRecords("teamMembers"),
    getCollectionRecords("projectMembers", { projectId }),
  ]);

  const assignedIds = new Set(projectMembers.map((link) => link.memberId));
  return teamMembers.filter((member) => assignedIds.has(member.id));
}

async function requireProject(projectId) {
  const project = await getRecord("projects", projectId);
  if (!project) {
    notFound();
  }
  return project;
}

export async function getProjectsHubView() {
  const [projects, projectMembers, leadCounts, campaignCounts, taskCounts] =
    await Promise.all([
      getCollectionRecords("projects"),
      getCollectionRecords("projectMembers"),
      getGroupedCounts("leads", "projectId"),
      getGroupedCounts("campaigns", "projectId"),
      getGroupedCounts("tasks", "projectId"),
    ]);

  const membersByProject = groupBy(projectMembers, "projectId");

  return {
    projectCards: projects.map((project) => ({
      ...toProject(project),
      leadCount: leadCounts[project.id] || 0,
      campaignCount: campaignCounts[project.id] || 0,
      taskCount: taskCounts[project.id] || 0,
      teamCount: (membersByProject[project.id] || []).length,
    })),
  };
}

/**
 * Agency-wide team view. Unlike the project-scoped one, `assignedProjectIds` here
 * spans every project, because the page pivots between them.
 */
export async function getAgencyTeamView() {
  const [projects, teamMembers, projectMembers] = await Promise.all([
    getCollectionRecords("projects"),
    getCollectionRecords("teamMembers"),
    getCollectionRecords("projectMembers"),
  ]);

  const assignedByMemberId = groupBy(projectMembers, "memberId");

  return {
    projects: projects.map(toProject),
    teamMembers: teamMembers.map((member) => ({
      ...member,
      assignedProjectIds: (assignedByMemberId[member.id] || []).map(
        (link) => link.projectId,
      ),
    })),
  };
}

export async function getAgencySettingsView() {
  return { agencySettings: await getRecord("agencySettings", "agency") };
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

  const projectName = Object.fromEntries(
    projects.map((project) => [project.id, project.name]),
  );

  return {
    projects: projects.map(toProject),
    teamMembers,
    projectMembers,
    unreadCount: approvals.length + reviewTasks.length,
    /**
     * The items behind `unreadCount`, so the bell can show what it is counting
     * instead of just a number. Each carries the href of the module it lives in.
     */
    notifications: [
      ...approvals.map((approval) => ({
        id: `approval-${approval.id}`,
        kind: "Approval",
        title: approval.title,
        project: projectName[approval.projectId] || "",
        href: `/projects/${approval.projectId}/approvals`,
      })),
      ...reviewTasks.map((task) => ({
        id: `task-${task.id}`,
        kind: "In review",
        title: task.title,
        project: projectName[task.projectId] || "",
        href: `/projects/${task.projectId}/tasks`,
      })),
    ],
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

/**
 * Reads only what the dashboard renders, in one round trip.
 *
 * Two collections used to dominate this view: every lead (~122 rows) was pulled
 * just to count leads by status, and every activity (~255 rows) to show five. Both
 * are now aggregate or capped queries. `channelBreakdowns` and `goals` were
 * fetched and never read, so they are gone. What remains is a single statement —
 * see `getProjectOverviewRows` for why that matters on this database.
 */
export async function getProjectOverviewView(projectId) {
  const rows = await getProjectOverviewRows(projectId);

  if (!rows.project) {
    notFound();
  }

  const project = toProject(rows.project);
  const leadCount = Object.values(rows.leadStatusCounts).reduce(
    (total, count) => total + count,
    0,
  );

  return {
    project,
    bundle: {
      project,
      kpis: mapKpis(rows.kpis),
      series: rows.series.map(({ id, projectId: _projectId, ...item }) => item),
      campaigns: rows.campaigns,
      leadCount,
      // The pipeline funnel needs counts per status, not the lead records.
      leadStatusCounts: rows.leadStatusCounts,
      topCampaigns: rows.campaigns
        .slice()
        .sort((a, b) => Number(b.conversions) - Number(a.conversions))
        .slice(0, 4),
      upcomingTasks: rows.upcomingTasks,
    },
    recentActivity: rows.recentActivity.map(toActivity),
    teamMembers: rows.teamMembers,
  };
}

export async function getProjectTasksView(projectId) {
  const project = await requireProject(projectId);
  const [tasks, teamMembers] = await Promise.all([
    getCollectionRecords("tasks", { projectId }),
    getAssignedTeamMembers(projectId),
  ]);

  return {
    project: toProject(project),
    tasks,
    teamMembers,
  };
}

/**
 * The whole leads module in one view. The old client hook issued three separate
 * requests — summary, a filtered list re-fetched on every keystroke, and a lead
 * detail on open. Handing over every lead with its activity attached lets the
 * screen filter and open records with no further round trips.
 */
export async function getProjectLeadsView(projectId) {
  const project = await requireProject(projectId);
  const [leadRecords, activities, teamMembers] = await Promise.all([
    getCollectionRecords("leads", { projectId }),
    getCollectionRecords("leadActivities", { projectId }),
    getAssignedTeamMembers(projectId),
  ]);

  const activitiesByLeadId = groupBy(activities, "leadId");
  const statusCounts = leadRecords.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});
  const wonCount = statusCounts.Won || 0;

  return {
    project: toProject(project),
    leads: leadRecords.map((lead) => ({
      ...toLead(lead),
      activities: (activitiesByLeadId[lead.id] || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(toActivity),
    })),
    summary: {
      total: leadRecords.length,
      statusCounts,
      conversionRate: leadRecords.length ? (wonCount / leadRecords.length) * 100 : 0,
    },
    filters: {
      sources: [...new Set(leadRecords.map((lead) => lead.source))].sort(),
      // Only people who actually own a lead here. Offering someone with no
      // records can only ever filter down to an empty list.
      assignedPeople: [
        ...new Set(leadRecords.map((lead) => lead.assignedTeamMember).filter(Boolean)),
      ].sort(),
    },
    teamMembers,
  };
}

export async function getProjectCampaignsView(projectId) {
  const project = await requireProject(projectId);
  return {
    project: toProject(project),
    campaigns: await getCollectionRecords("campaigns", { projectId }),
  };
}

export async function getProjectCalendarView(projectId) {
  const project = await requireProject(projectId);
  const [events, teamMembers] = await Promise.all([
    getCollectionRecords("calendarEvents", { projectId }),
    getAssignedTeamMembers(projectId),
  ]);

  return { project: toProject(project), events, teamMembers };
}

/**
 * Team and project settings share a shape: the project plus every member tagged
 * with whether they are assigned to it. `projectMembers` is filtered to this
 * project, so `assignedProjectIds` holds at most this one id — which is all the
 * screens test against.
 */
async function getProjectMembershipView(projectId) {
  const project = await requireProject(projectId);
  const [teamMembers, projectMembers] = await Promise.all([
    getCollectionRecords("teamMembers"),
    getCollectionRecords("projectMembers", { projectId }),
  ]);

  const assignedByMemberId = groupBy(projectMembers, "memberId");

  return {
    project: toProject(project),
    teamMembers: teamMembers.map((member) => ({
      ...member,
      assignedProjectIds: (assignedByMemberId[member.id] || []).map(
        (link) => link.projectId,
      ),
    })),
  };
}

export const getProjectTeamView = getProjectMembershipView;
export const getProjectSettingsView = getProjectMembershipView;

export async function getProjectApprovalsView(projectId) {
  const project = await requireProject(projectId);
  const [approvals, approvalComments, teamMembers] = await Promise.all([
    getCollectionRecords("approvals", { projectId }),
    getCollectionRecords("approvalComments"),
    getAssignedTeamMembers(projectId),
  ]);

  const commentsByApprovalId = groupBy(approvalComments, "approvalId");

  return {
    project: toProject(project),
    approvals: approvals.map((approval) => toApproval(approval, commentsByApprovalId)),
    teamMembers,
  };
}

export async function getProjectReportsView(projectId) {
  const project = await requireProject(projectId);
  const [configs, recipients] = await Promise.all([
    getCollectionRecords("reportConfigs", { projectId }),
    getCollectionRecords("reportRecipients"),
  ]);

  const config = configs[0] || null;

  return {
    project: toProject(project),
    reportConfig: config
      ? {
          ...config,
          lastSentDate: config.lastSentAt,
          recipients: recipients
            .filter((item) => item.reportConfigId === config.id)
            .map((item) => item.email),
        }
      : null,
  };
}

export async function getProjectClientView(projectId) {
  const project = await requireProject(projectId);
  const [kpiSnapshots, timeSeries, goals] = await Promise.all([
    getCollectionRecords("kpiSnapshots", { projectId }),
    getCollectionRecords("timeSeries", { projectId }),
    getCollectionRecords("goals", { projectId }),
  ]);

  return {
    project: toProject(project),
    kpis: mapKpis(kpiSnapshots),
    series: timeSeries.map(({ id, projectId: _projectId, ...item }) => item),
    goals: goals.map(({ id, projectId: _projectId, ...item }) => item),
  };
}
