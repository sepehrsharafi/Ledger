/**
 * Everything the persistent shell needs is derived from the pathname alone, so
 * the chrome — breadcrumb, heading, primary action — can paint before any page
 * code or data has loaded. `action` is only the button's label; the mounted
 * screen registers what it does (see context/PageAction).
 */

export const projectModuleMeta = {
  overview: {
    title: "Overview",
    description: "Premium project performance and operating insight.",
    action: "Export report",
    // The overview screen renders its own hero heading and reporting period.
    ownHeading: true,
  },
  leads: {
    title: "Leads",
    description: "Project-scoped CRM, pipeline visibility, and activity tracking.",
    action: "New lead",
  },
  campaigns: {
    title: "Campaigns",
    description: "Channel performance, pacing, and drill-down stats.",
    action: "New campaign",
  },
  calendar: {
    title: "Content Calendar",
    description: "Scheduled content moments across the month.",
    action: "Add item",
  },
  tasks: {
    title: "Tasks",
    description: "Kanban workflow for project delivery.",
    action: "New task",
  },
  team: {
    title: "Team",
    description: "Project-specific ownership and capacity.",
    action: "Invite",
  },
  approvals: {
    title: "Approvals",
    description: "Creative review with in-memory decisions and comments.",
    action: "Request approval",
  },
  reports: {
    title: "Reports",
    description: "Sections, schedule, and report engagement.",
    action: "Send now",
  },
  "client-view": {
    title: "Client View",
    description: "Read-only white-labeled summary.",
    // Client view is a white-labeled surface with no agency chrome.
    bare: true,
  },
  "project-settings": {
    title: "Project Settings",
    description: "Project identity, status, and team ownership.",
    action: "Save",
  },
};

const segmentToModule = {
  "": "overview",
  leads: "leads",
  campaigns: "campaigns",
  calendar: "calendar",
  tasks: "tasks",
  team: "team",
  approvals: "approvals",
  reports: "reports",
  "client-view": "client-view",
  settings: "project-settings",
};

const workspaceMeta = {
  "/projects": {
    title: "Projects",
    description: "Every client workspace, organized in one place.",
    action: "New project",
  },
  "/team": {
    title: "Team",
    description: "Agency capacity, ownership, and workload in one place.",
    action: "Invite",
  },
  "/settings": {
    title: "Settings",
    description:
      "Agency profile, branding defaults, notifications, and demo integrations.",
    action: "Save",
  },
};

export function resolveRouteMeta(pathname) {
  const segments = (pathname || "").split("/").filter(Boolean);
  const isProjectRoute = segments[0] === "projects" && Boolean(segments[1]);
  const module = isProjectRoute ? segmentToModule[segments[2] || ""] || "overview" : null;
  const meta = isProjectRoute
    ? projectModuleMeta[module]
    : workspaceMeta[`/${segments[0] || ""}`] || workspaceMeta["/projects"];

  return {
    projectId: isProjectRoute ? segments[1] : null,
    module,
    title: meta.title,
    description: meta.description,
    action: meta.action || null,
    hidePageHeading: Boolean(meta.ownHeading),
    bare: Boolean(meta.bare),
  };
}
