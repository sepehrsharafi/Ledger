import { createInitialData } from "../data/mockData.js";

function mapProject(project) {
  const { createdDate, ...rest } = project;
  return {
    ...rest,
    createdAt: createdDate,
  };
}

function mapTeamMember(member) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    avatarColor: member.avatarColor,
  };
}

function mapLead(lead) {
  const { createdDate, lastContactedDate, ...rest } = lead;
  return {
    ...rest,
    createdAt: createdDate,
    lastContactedAt: lastContactedDate,
  };
}

function mapLeadActivity(activity) {
  const { timestamp, ...rest } = activity;
  return {
    ...rest,
    createdAt: timestamp,
  };
}

function mapCampaign(campaign) {
  return {
    ...campaign,
  };
}

function mapTask(task) {
  return {
    ...task,
  };
}

function mapCalendarEvent(event) {
  return {
    ...event,
  };
}

function mapApproval(approval) {
  const { submittedDate, comments, ...rest } = approval;
  return {
    ...rest,
    submittedAt: submittedDate,
  };
}

function mapApprovalComment(comment, approvalId) {
  const { timestamp, ...rest } = comment;
  return {
    ...rest,
    approvalId,
    createdAt: timestamp,
  };
}

function mapReportConfig(config) {
  const { lastSentDate, ...rest } = config;
  return {
    ...rest,
    lastSentAt: lastSentDate,
  };
}

function mapKpiSnapshots(kpiSnapshots) {
  return Object.entries(kpiSnapshots).flatMap(([projectId, metrics]) =>
    Object.entries(metrics || {}).map(([metric, snapshot]) => ({
      id: `${projectId}-${metric}`,
      projectId,
      metric,
      current: snapshot.current,
      previous: snapshot.previous,
      sparkline: snapshot.sparkline,
    }))
  );
}

function mapTimeSeries(timeSeries) {
  return Object.entries(timeSeries).flatMap(([projectId, points]) =>
    (points || []).map((point) => ({
      id: `${projectId}-${point.month}`,
      projectId,
      ...point,
    }))
  );
}

function mapChannelBreakdowns(channelBreakdowns) {
  return Object.entries(channelBreakdowns).flatMap(([projectId, rows]) =>
    (rows || []).map((row) => ({
      id: `${projectId}-${row.channel.toLowerCase().replace(/\s+/g, "-")}`,
      projectId,
      ...row,
    }))
  );
}

function mapTimelineAnnotations(timelineAnnotations) {
  return Object.entries(timelineAnnotations).flatMap(([projectId, rows]) =>
    (rows || []).map((row, index) => ({
      id: `${projectId}-annotation-${index + 1}`,
      projectId,
      ...row,
    }))
  );
}

function mapGoals(goals) {
  return Object.entries(goals).flatMap(([projectId, rows]) =>
    (rows || []).map((row, index) => ({
      id: `${projectId}-goal-${index + 1}`,
      projectId,
      ...row,
    }))
  );
}

export function createBackendSeed() {
  const data = createInitialData();

  const approvals = data.approvals.map(mapApproval);
  const approvalComments = data.approvals.flatMap((approval) =>
    approval.comments.map((comment) => mapApprovalComment(comment, approval.id))
  );

  return {
    projects: data.projects.map(mapProject),
    teamMembers: data.teamMembers.map(mapTeamMember),
    projectMembers: data.teamMembers.flatMap((member) =>
      member.assignedProjectIds.map((projectId) => ({
        projectId,
        memberId: member.id,
      }))
    ),
    kpiSnapshots: mapKpiSnapshots(data.kpiSnapshots),
    timeSeries: mapTimeSeries(data.timeSeries),
    channelBreakdowns: mapChannelBreakdowns(data.channelBreakdowns),
    timelineAnnotations: mapTimelineAnnotations(data.timelineAnnotations),
    goals: mapGoals(data.goals),
    leads: data.leads.map(mapLead),
    leadActivities: data.leadActivities.map(mapLeadActivity),
    campaigns: data.campaigns.map(mapCampaign),
    tasks: data.tasks.map(mapTask),
    calendarEvents: data.calendarEvents.map(mapCalendarEvent),
    approvals,
    approvalComments,
    reportConfigs: data.reportConfigs.map(mapReportConfig),
    reportRecipients: data.reportConfigs.flatMap((config) =>
      (config.recipients || []).map((email) => ({
        reportConfigId: config.id,
        email,
      }))
    ),
    agencySettings: {
      id: "agency",
      agencyName: data.agencySettings.agencyName,
      logoPlaceholder: data.agencySettings.logoPlaceholder,
      notifications: data.agencySettings.notifications,
      integrations: data.agencySettings.integrations,
      updatedAt: new Date().toISOString(),
    },
  };
}
