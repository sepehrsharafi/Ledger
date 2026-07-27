"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { ModuleSkeletonFor } from "@/components/RouteSkeleton";
import {
  useProjectLeadsData,
  useProjectModuleData,
  useProjectOverviewData,
} from "@/lib/useLedgerData";

/**
 * One entry per module route. Each screen is its own dynamic chunk, so a route
 * only downloads and compiles the module it renders instead of all ten; each
 * chunk's loading fallback is the very skeleton that route already painted.
 */
function lazyScreen(module, load) {
  return dynamic(load, { loading: () => <ModuleSkeletonFor module={module} /> });
}

const SCREENS = {
  overview: lazyScreen("overview", () =>
    import("@/components/project-modules/OverviewScreen"),
  ),
  leads: lazyScreen("leads", () => import("@/components/project-modules/LeadsScreen")),
  campaigns: lazyScreen("campaigns", () =>
    import("@/components/project-modules/CampaignsScreen"),
  ),
  calendar: lazyScreen("calendar", () =>
    import("@/components/project-modules/CalendarScreen"),
  ),
  tasks: lazyScreen("tasks", () => import("@/components/project-modules/TasksScreen")),
  team: lazyScreen("team", () =>
    import("@/components/project-modules/ProjectTeamScreen"),
  ),
  approvals: lazyScreen("approvals", () =>
    import("@/components/project-modules/ApprovalWorkbench"),
  ),
  reports: lazyScreen("reports", () =>
    import("@/components/project-modules/ReportsScreen"),
  ),
  "client-view": lazyScreen("client-view", () =>
    import("@/components/project-modules/ClientViewScreen"),
  ),
  "project-settings": lazyScreen("project-settings", () =>
    import("@/components/project-modules/ProjectSettingsScreen"),
  ),
};

/**
 * Maps each module's screen onto the data it needs. Keeping these as small pure
 * functions is what lets the component below stay a handful of lines.
 */
const PROPS = {
  overview: ({ bundle, overview }) => ({
    bundle,
    recentActivity: overview.recentActivity,
    store: { teamMembers: overview.teamMembers },
  }),
  leads: ({ project, leads }) => ({
    project,
    leads: leads.leads,
    summary: leads.summary,
    filterOptions: leads.filters,
    teamMembers: leads.teamMembers,
    selectedLead: leads.selectedLead,
    isLeadDetailLoading: leads.isLeadDetailLoading,
    isListLoading: leads.isListLoading,
    onStatusChange: leads.updateLeadStatus,
    onCreateLead: leads.createLead,
    onDeleteLead: leads.deleteLead,
    onNote: leads.addLeadNote,
    onOpenLead: leads.openLead,
    onCloseLead: leads.closeLead,
    query: leads.query,
    setQuery: leads.setQuery,
    statusFilter: leads.statusFilter,
    setStatusFilter: leads.setStatusFilter,
    sourceFilter: leads.sourceFilter,
    setSourceFilter: leads.setSourceFilter,
    assigneeFilter: leads.assigneeFilter,
    setAssigneeFilter: leads.setAssigneeFilter,
  }),
  campaigns: ({ bundle, module }) => ({
    bundle,
    onCreateCampaign: module.createCampaign,
    onUpdateCampaign: module.updateCampaign,
    onDeleteCampaign: module.deleteCampaign,
  }),
  calendar: ({ bundle, module }) => ({
    bundle,
    store: module.store,
    onCreateEvent: module.createCalendarEvent,
    onUpdateEvent: module.updateCalendarEvent,
    onDeleteEvent: module.deleteCalendarEvent,
  }),
  tasks: ({ bundle, module }) => ({
    bundle,
    store: module.store,
    onMoveTask: module.updateTaskColumn,
    onCreateTask: module.createTask,
    onUpdateTask: module.updateTask,
    onDeleteTask: module.deleteTask,
  }),
  team: ({ bundle, module, projectId }) => ({
    bundle,
    store: module.store,
    onToggleAssignment: (memberId, options) =>
      module.toggleTeamMemberAssignment(projectId, memberId, options),
  }),
  approvals: ({ bundle, module }) => ({
    bundle,
    store: module.store,
    onStatusChange: module.updateApprovalStatus,
    onComment: module.addApprovalComment,
    onCreateApproval: module.createApproval,
    onDeleteApproval: module.deleteApproval,
  }),
  reports: ({ bundle, module }) => ({
    bundle,
    onUpdateReport: module.updateReportConfig,
  }),
  "client-view": ({ bundle }) => ({ bundle }),
  "project-settings": ({ bundle, module }) => ({
    bundle,
    store: module.store,
    onUpdateProject: module.updateProject,
  }),
};

export default function ProjectModulePage({ projectId, module }) {
  const isOverview = module === "overview";
  const isLeads = module === "leads";

  const overview = useProjectOverviewData(projectId, isOverview);
  const leads = useProjectLeadsData(projectId, isLeads);
  const moduleData = useProjectModuleData(projectId, module);

  const bundle = isOverview
    ? overview.bundle
    : isLeads
      ? null
      : moduleData.selectors.getProjectBundle(projectId);

  const project = isOverview
    ? overview.bundle?.project || null
    : isLeads
      ? leads.project
      : bundle?.project || null;

  // Only this module's own request gates the content area — the shell resolves
  // its own data independently and never blocks the module.
  const isLoading = isOverview
    ? overview.isLoading
    : isLeads
      ? leads.isSummaryLoading
      : moduleData.isLoading;

  if (isLoading) {
    return <ModuleSkeletonFor module={module} />;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found."
        description="Return to the Projects Hub and choose an existing project."
        action={
          <Link href="/projects" className="btn btn-primary">
            Back to projects
          </Link>
        }
      />
    );
  }

  const Screen = SCREENS[module] || SCREENS.leads;
  const buildProps = PROPS[module] || PROPS.leads;

  return (
    <Screen {...buildProps({ bundle, project, overview, leads, module: moduleData, projectId })} />
  );
}
