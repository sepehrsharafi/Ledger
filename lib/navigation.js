/**
 * Pure sidebar derivation. Keeping it out of the shell component means the nav
 * shape is one readable list rather than logic threaded through JSX.
 */

const PROJECT_NAV = [
  { module: "overview", segment: "", label: "Overview", icon: "overview" },
  { module: "leads", segment: "/leads", label: "Leads", icon: "leads", count: "leads" },
  {
    module: "campaigns",
    segment: "/campaigns",
    label: "Campaigns",
    icon: "campaigns",
    count: "campaigns",
  },
  { module: "calendar", segment: "/calendar", label: "Calendar", icon: "calendar" },
  { module: "tasks", segment: "/tasks", label: "Tasks", icon: "tasks", count: "tasks" },
  { module: "team", segment: "/team", label: "Team", icon: "team" },
  {
    module: "approvals",
    segment: "/approvals",
    label: "Approvals",
    icon: "approvals",
    count: "approvals",
    countTone: "text-warn",
  },
  { module: "reports", segment: "/reports", label: "Reports", icon: "reports" },
];

const MANAGE_NAV = [
  { path: "/projects", label: "Projects", icon: "projects" },
  { path: "/settings", label: "Settings", icon: "settings", adminOnly: true },
];

export function buildSidebarNav({
  projectId,
  module,
  pathname,
  viewerRole,
  counts = {},
}) {
  const allowed = (item) => !(viewerRole === "Member" && item.adminOnly);

  const main = projectId
    ? PROJECT_NAV.filter(allowed).map((item) => ({
        key: item.module,
        href: `/projects/${projectId}${item.segment}`,
        label: item.label,
        icon: item.icon,
        count: item.count ? counts[item.count] : undefined,
        countTone: item.countTone,
        active: module === item.module,
      }))
    : [];

  // Workspace-level links keep the project in the query string so returning to a
  // module route lands back in the same workspace.
  const suffix = projectId ? `?project=${projectId}` : "";
  const manage = MANAGE_NAV.filter(allowed).map((item) => ({
    key: item.path,
    href: `${item.path}${suffix}`,
    label: item.label,
    icon: item.icon,
    active: pathname === item.path,
  }));

  return { main, manage };
}
