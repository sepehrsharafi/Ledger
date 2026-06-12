import crypto from "node:crypto";
import { backendEntities } from "./entities.js";

export const backendCollectionConfig = {
  projects: {
    table: "projects",
    columns: {
      id: "id",
      name: "name",
      clientName: "client_name",
      type: "type",
      status: "status",
      brandPrimary: "brand_primary",
      brandAccent: "brand_accent",
      createdAt: "created_at",
      topKpiLabel: "top_kpi_label",
      topKpiValue: "top_kpi_value",
    },
    dateFields: ["createdAt"],
    timestampFields: [],
    numericFields: [],
    key: "id",
    required: ["name", "clientName", "type", "brandPrimary", "brandAccent", "topKpiLabel", "topKpiValue"],
    defaults: {
      status: "Active",
      createdAt: null,
    },
  },
  teamMembers: {
    table: "team_members",
    columns: {
      id: "id",
      name: "name",
      email: "email",
      role: "role",
      avatarColor: "avatar_color",
    },
    dateFields: [],
    timestampFields: [],
    numericFields: [],
    key: "id",
    required: ["name", "email", "role", "avatarColor"],
  },
  projectMembers: {
    table: "project_members",
    columns: {
      projectId: "project_id",
      memberId: "member_id",
    },
    dateFields: [],
    timestampFields: [],
    numericFields: [],
    compositeKey: ["projectId", "memberId"],
    required: ["projectId", "memberId"],
  },
  kpiSnapshots: {
    table: "kpi_snapshots",
    columns: {
      id: "id",
      projectId: "project_id",
      metric: "metric",
      current: "current_value",
      previous: "previous_value",
      sparkline: "sparkline",
    },
    jsonFields: ["sparkline"],
    dateFields: [],
    timestampFields: [],
    numericFields: ["current", "previous"],
    key: "id",
    required: ["projectId", "metric", "current", "previous", "sparkline"],
  },
  timeSeries: {
    table: "time_series",
    columns: {
      id: "id",
      projectId: "project_id",
      month: "month_start",
      traffic: "traffic",
      conversions: "conversions",
      spend: "spend",
      leads: "leads",
    },
    dateFields: ["month"],
    timestampFields: [],
    numericFields: ["traffic", "conversions", "spend", "leads"],
    key: "id",
    required: ["projectId", "month", "traffic", "conversions", "spend", "leads"],
  },
  channelBreakdowns: {
    table: "channel_breakdowns",
    columns: {
      id: "id",
      projectId: "project_id",
      channel: "channel",
      visits: "visits",
      conversions: "conversions",
      spend: "spend",
      costPerLead: "cost_per_lead",
    },
    dateFields: [],
    timestampFields: [],
    numericFields: ["visits", "conversions", "spend", "costPerLead"],
    key: "id",
    required: ["projectId", "channel", "visits", "conversions", "spend", "costPerLead"],
  },
  timelineAnnotations: {
    table: "timeline_annotations",
    columns: {
      id: "id",
      projectId: "project_id",
      date: "annotation_date",
      label: "label",
      note: "note",
      author: "author",
    },
    dateFields: ["date"],
    timestampFields: [],
    numericFields: [],
    key: "id",
    required: ["projectId", "date", "label", "note", "author"],
  },
  goals: {
    table: "goals",
    columns: {
      id: "id",
      projectId: "project_id",
      label: "label",
      targetValue: "target_value",
      currentValue: "current_value",
      unit: "unit",
      period: "period",
    },
    dateFields: [],
    timestampFields: [],
    numericFields: ["targetValue", "currentValue"],
    key: "id",
    required: ["projectId", "label", "targetValue", "currentValue", "unit", "period"],
  },
  leads: {
    table: "leads",
    columns: {
      id: "id",
      projectId: "project_id",
      name: "name",
      email: "email",
      company: "company",
      phone: "phone",
      source: "source",
      status: "status",
      estimatedValue: "estimated_value",
      capturedFrom: "captured_from",
      assignedTeamMember: "assigned_team_member",
      createdAt: "created_at",
      lastContactedAt: "last_contacted_at",
    },
    dateFields: ["createdAt", "lastContactedAt"],
    timestampFields: [],
    numericFields: ["estimatedValue"],
    key: "id",
    required: ["projectId", "name", "email", "company", "phone", "source", "status", "capturedFrom", "assignedTeamMember"],
    defaults: {
      estimatedValue: null,
      createdAt: null,
      lastContactedAt: null,
    },
  },
  leadActivities: {
    table: "lead_activities",
    columns: {
      id: "id",
      leadId: "lead_id",
      projectId: "project_id",
      activityType: "activity_type",
      content: "content",
      author: "author",
      createdAt: "created_at",
    },
    dateFields: [],
    timestampFields: ["createdAt"],
    numericFields: [],
    key: "id",
    required: ["leadId", "projectId", "activityType", "content", "author"],
    defaults: {
      createdAt: null,
    },
  },
  campaigns: {
    table: "campaigns",
    columns: {
      id: "id",
      projectId: "project_id",
      name: "name",
      channel: "channel",
      status: "status",
      startDate: "start_date",
      endDate: "end_date",
      budget: "budget",
      spent: "spent",
      impressions: "impressions",
      clicks: "clicks",
      conversions: "conversions",
      owner: "owner",
      notes: "notes",
    },
    dateFields: ["startDate", "endDate"],
    timestampFields: [],
    numericFields: ["budget", "spent", "impressions", "clicks", "conversions"],
    key: "id",
    required: ["projectId", "name", "channel", "status", "startDate", "endDate", "owner", "notes"],
    defaults: {
      budget: 0,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
    },
  },
  tasks: {
    table: "tasks",
    columns: {
      id: "id",
      projectId: "project_id",
      title: "title",
      description: "description",
      column: "column_name",
      assignee: "assignee",
      dueDate: "due_date",
      priority: "priority",
      notes: "notes",
    },
    dateFields: ["dueDate"],
    timestampFields: [],
    numericFields: [],
    key: "id",
    required: ["projectId", "title", "description", "column", "assignee", "dueDate", "priority"],
    defaults: {
      notes: "",
    },
  },
  calendarEvents: {
    table: "calendar_events",
    columns: {
      id: "id",
      projectId: "project_id",
      title: "title",
      channel: "channel",
      date: "event_date",
      status: "status",
      assignee: "assignee",
    },
    dateFields: ["date"],
    timestampFields: [],
    numericFields: [],
    key: "id",
    required: ["projectId", "title", "channel", "date", "status", "assignee"],
  },
  approvals: {
    table: "approvals",
    columns: {
      id: "id",
      projectId: "project_id",
      title: "title",
      type: "type",
      requestType: "request_type",
      thumbnailColor: "thumbnail_color",
      status: "status",
      submittedBy: "submitted_by",
      submittedAt: "submitted_at",
      summary: "summary",
      details: "details",
      pros: "pros",
      cons: "cons",
      recommendation: "recommendation",
      attachments: "attachments",
    },
    dateFields: ["submittedAt"],
    timestampFields: [],
    numericFields: [],
    key: "id",
    required: ["projectId", "title", "type", "requestType", "thumbnailColor", "status", "submittedBy", "summary", "details", "pros", "cons", "recommendation"],
    defaults: {
      attachments: "",
    },
  },
  approvalComments: {
    table: "approval_comments",
    columns: {
      id: "id",
      approvalId: "approval_id",
      author: "author",
      message: "message",
      createdAt: "created_at",
    },
    dateFields: [],
    timestampFields: ["createdAt"],
    numericFields: [],
    key: "id",
    required: ["approvalId", "author", "message"],
  },
  reportConfigs: {
    table: "report_configs",
    columns: {
      id: "id",
      projectId: "project_id",
      includedSections: "included_sections",
      frequency: "frequency",
      internalReviewFirst: "internal_review_first",
      lastSentAt: "last_sent_at",
      engagementStats: "engagement_stats",
    },
    jsonFields: ["includedSections", "engagementStats"],
    dateFields: ["lastSentAt"],
    timestampFields: [],
    numericFields: [],
    key: "id",
    required: ["projectId", "includedSections", "frequency", "internalReviewFirst", "engagementStats"],
    defaults: {
      lastSentAt: null,
    },
  },
  reportRecipients: {
    table: "report_recipients",
    columns: {
      reportConfigId: "report_config_id",
      email: "email",
    },
    dateFields: [],
    timestampFields: [],
    numericFields: [],
    compositeKey: ["reportConfigId", "email"],
    required: ["reportConfigId", "email"],
  },
  agencySettings: {
    table: "agency_settings",
    columns: {
      id: "id",
      agencyName: "agency_name",
      logoPlaceholder: "logo_placeholder",
      notifications: "notifications",
      integrations: "integrations",
      updatedAt: "updated_at",
    },
    jsonFields: ["notifications", "integrations"],
    dateFields: [],
    timestampFields: ["updatedAt"],
    numericFields: [],
    key: "id",
    required: ["agencyName", "logoPlaceholder", "notifications", "integrations"],
    singleton: true,
  },
};

export function isBackendCollection(name) {
  return Object.prototype.hasOwnProperty.call(backendEntities, name);
}

export function getBackendCollectionConfig(name) {
  const config = backendCollectionConfig[name];
  if (!config) {
    throw new Error(`Unknown backend collection: ${name}`);
  }
  return config;
}

export function getRecordIdentity(collection, record) {
  const config = getBackendCollectionConfig(collection);
  if (config.key) {
    return record[config.key];
  }
  return config.compositeKey.map((field) => record[field]).join("__");
}

export function parseRecordIdentity(collection, recordId) {
  const config = getBackendCollectionConfig(collection);
  if (config.key) {
    return { [config.key]: recordId };
  }
  const parts = recordId.split("__");
  if (parts.length !== config.compositeKey.length) {
    throw new Error(`Invalid record id for ${collection}`);
  }
  return Object.fromEntries(config.compositeKey.map((field, index) => [field, decodeURIComponent(parts[index])]));
}

export function buildRecordIdentity(collection, payload) {
  const config = getBackendCollectionConfig(collection);
  if (config.key) {
    return payload[config.key] || crypto.randomUUID();
  }
  return config.compositeKey.map((field) => encodeURIComponent(String(payload[field] ?? ""))).join("__");
}

export function applyDefaults(collection, record) {
  const config = getBackendCollectionConfig(collection);
  const defaults = config.defaults || {};
  const nextRecord = { ...defaults, ...record };

  if (collection === "projects" && !nextRecord.createdAt) {
    nextRecord.createdAt = new Date().toISOString().slice(0, 10);
  }

  if (collection === "leads") {
    if (!nextRecord.createdAt) {
      nextRecord.createdAt = new Date().toISOString().slice(0, 10);
    }
    if (!nextRecord.lastContactedAt) {
      nextRecord.lastContactedAt = new Date().toISOString().slice(0, 10);
    }
  }

  if (collection === "leadActivities" && !nextRecord.createdAt) {
    nextRecord.createdAt = new Date().toISOString();
  }

  if (collection === "approvals") {
    if (!nextRecord.submittedAt) {
      nextRecord.submittedAt = new Date().toISOString().slice(0, 10);
    }
  }

  if (collection === "agencySettings") {
    nextRecord.id = "agency";
    nextRecord.updatedAt = new Date().toISOString();
  }

  return nextRecord;
}

export function validatePayload(collection, payload) {
  const config = getBackendCollectionConfig(collection);
  const missing = (config.required || []).filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
  return missing;
}
