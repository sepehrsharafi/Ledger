export const projectModuleMeta = {
  overview: {
    title: "Overview",
    description: "Premium project performance and operating insight.",
  },
  leads: {
    title: "Leads",
    description: "Project-scoped CRM, pipeline visibility, and activity tracking.",
  },
  campaigns: {
    title: "Campaigns",
    description: "Channel performance, pacing, and drill-down stats.",
  },
  calendar: {
    title: "Content Calendar",
    description: "Scheduled content moments across the month.",
  },
  tasks: {
    title: "Tasks",
    description: "Kanban workflow for project delivery.",
  },
  team: {
    title: "Team",
    description: "Project-specific ownership and capacity.",
  },
  approvals: {
    title: "Approvals",
    description: "Creative review with in-memory decisions and comments.",
  },
  reports: {
    title: "Reports",
    description: "Sections, schedule, and report engagement.",
  },
  "client-view": {
    title: "Client View",
    description: "Read-only white-labeled summary.",
  },
  "project-settings": {
    title: "Project Settings",
    description: "Project identity, status, and team ownership.",
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
  },
  "/team": {
    title: "Team",
    description: "Agency capacity, ownership, and workload in one place.",
  },
  "/settings": {
    title: "Settings",
    description:
      "Agency profile, branding defaults, notifications, and demo integrations.",
  },
};

/**
 * Derives everything the persistent shell needs from the pathname alone, so the
 * chrome can render before any page code or data has loaded.
 */
export function resolveRouteMeta(pathname) {
  const segments = (pathname || "").split("/").filter(Boolean);

  if (segments[0] === "projects" && segments[1]) {
    const projectId = segments[1];
    const module = segmentToModule[segments[2] || ""] || "overview";
    const meta = projectModuleMeta[module] || projectModuleMeta.overview;

    return {
      projectId,
      module,
      title: meta.title,
      description: meta.description,
      // The overview dashboard renders its own hero heading.
      hidePageHeading: module === "overview",
      // Client view is a white-labeled surface with no agency chrome.
      bare: module === "client-view",
    };
  }

  const meta = workspaceMeta[`/${segments[0] || ""}`] || workspaceMeta["/projects"];

  return {
    projectId: null,
    module: null,
    title: meta.title,
    description: meta.description,
    hidePageHeading: false,
    bare: false,
  };
}
