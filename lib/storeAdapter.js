import { groupBy } from "./utils.js";

export function createEmptyStore() {
  return {
    projects: [],
    kpiSnapshots: {},
    timeSeries: {},
    channelBreakdowns: {},
    timelineAnnotations: {},
    goals: {},
    leads: [],
    leadActivities: [],
    campaigns: [],
    tasks: [],
    calendarEvents: [],
    approvals: [],
    teamMembers: [],
    reportConfigs: [],
    agencySettings: {
      agencyName: "",
      logoPlaceholder: "",
      notifications: {},
      integrations: [],
    },
  };
}

function groupProjectRows(rows, mapper) {
  return Object.fromEntries(
    Object.entries(groupBy(rows, "projectId")).map(([projectId, items]) => [
      projectId,
      items.map(mapper),
    ])
  );
}

export function createStoreFromSnapshot(snapshot) {
  if (!snapshot) {
    return createEmptyStore();
  }

  const teamMembersById = Object.fromEntries(
    (snapshot.teamMembers || []).map((member) => [member.id, member])
  );
  const assignedByMemberId = Object.fromEntries(
    (snapshot.teamMembers || []).map((member) => [member.id, []])
  );

  for (const link of snapshot.projectMembers || []) {
    assignedByMemberId[link.memberId] = assignedByMemberId[link.memberId] || [];
    assignedByMemberId[link.memberId].push(link.projectId);
  }

  const approvalCommentsByApprovalId = groupBy(
    snapshot.approvalComments || [],
    "approvalId"
  );
  const reportRecipientsByConfigId = groupBy(
    snapshot.reportRecipients || [],
    "reportConfigId"
  );

  const kpiSnapshots = {};
  for (const item of snapshot.kpiSnapshots || []) {
    kpiSnapshots[item.projectId] = kpiSnapshots[item.projectId] || {};
    kpiSnapshots[item.projectId][item.metric] = {
      current: item.current,
      previous: item.previous,
      sparkline: item.sparkline,
    };
  }

  return {
    projects: (snapshot.projects || []).map(({ createdAt, ...project }) => ({
      ...project,
      createdDate: createdAt,
    })),
    kpiSnapshots,
    timeSeries: groupProjectRows(snapshot.timeSeries || [], ({ id, projectId, ...point }) => point),
    channelBreakdowns: groupProjectRows(
      snapshot.channelBreakdowns || [],
      ({ id, projectId, ...row }) => row
    ),
    timelineAnnotations: groupProjectRows(
      snapshot.timelineAnnotations || [],
      ({ id, projectId, ...row }) => row
    ),
    goals: groupProjectRows(snapshot.goals || [], ({ id, projectId, ...row }) => row),
    leads: (snapshot.leads || []).map(({ createdAt, lastContactedAt, ...lead }) => ({
      ...lead,
      createdDate: createdAt,
      lastContactedDate: lastContactedAt,
    })),
    leadActivities: (snapshot.leadActivities || []).map(
      ({ createdAt, ...activity }) => ({
        ...activity,
        timestamp: createdAt,
      })
    ),
    campaigns: snapshot.campaigns || [],
    tasks: snapshot.tasks || [],
    calendarEvents: snapshot.calendarEvents || [],
    approvals: (snapshot.approvals || []).map(
      ({ submittedAt, ...approval }) => ({
        ...approval,
        submittedDate: submittedAt,
        comments: (approvalCommentsByApprovalId[approval.id] || []).map(
          ({ approvalId, createdAt, ...comment }) => ({
            ...comment,
            timestamp: createdAt,
          })
        ),
      })
    ),
    teamMembers: Object.values(teamMembersById).map((member) => ({
      ...member,
      assignedProjectIds: assignedByMemberId[member.id] || [],
    })),
    reportConfigs: (snapshot.reportConfigs || []).map(
      ({ lastSentAt, ...config }) => ({
        ...config,
        lastSentDate: lastSentAt,
        recipients: (reportRecipientsByConfigId[config.id] || []).map(
          (item) => item.email
        ),
      })
    ),
    agencySettings:
      snapshot.agencySettings ||
      {
        agencyName: "",
        logoPlaceholder: "",
        notifications: {},
        integrations: [],
      },
  };
}
