"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { ModuleSkeleton } from "@/components/Skeleton";
import {
  useProjectLeadsData,
  useProjectModuleData,
  useProjectOverviewData,
} from "@/lib/useLedgerData";

function CardsFallback() {
  return <ModuleSkeleton cards={4} rows={5} />;
}

function BoardFallback() {
  return <ModuleSkeleton cards={0} board />;
}

// Each screen is its own chunk, so a route only ever downloads and compiles the
// module it renders instead of all ten (recharts included).
const ApprovalWorkbench = dynamic(
  () => import("@/components/project-modules/ApprovalWorkbench"),
  { loading: CardsFallback },
);
const CalendarScreen = dynamic(
  () => import("@/components/project-modules/CalendarScreen"),
  { loading: CardsFallback },
);
const CampaignsScreen = dynamic(
  () => import("@/components/project-modules/CampaignsScreen"),
  { loading: CardsFallback },
);
const ClientViewScreen = dynamic(
  () => import("@/components/project-modules/ClientViewScreen"),
  { loading: CardsFallback },
);
const LeadsScreen = dynamic(
  () => import("@/components/project-modules/LeadsScreen"),
  { loading: CardsFallback },
);
const OverviewScreen = dynamic(
  () => import("@/components/project-modules/OverviewScreen"),
  { loading: CardsFallback },
);
const ProjectSettingsScreen = dynamic(
  () => import("@/components/project-modules/ProjectSettingsScreen"),
  { loading: CardsFallback },
);
const ProjectTeamScreen = dynamic(
  () => import("@/components/project-modules/ProjectTeamScreen"),
  { loading: CardsFallback },
);
const ReportsScreen = dynamic(
  () => import("@/components/project-modules/ReportsScreen"),
  { loading: CardsFallback },
);
const TasksScreen = dynamic(
  () => import("@/components/project-modules/TasksScreen"),
  { loading: BoardFallback },
);

export default function ProjectModulePage({ projectId, module }) {
  const isOverview = module === "overview";
  const isLeads = module === "leads";

  const overviewData = useProjectOverviewData(projectId, isOverview);
  const leadsData = useProjectLeadsData(projectId, isLeads);
  const moduleData = useProjectModuleData(projectId, module);

  const bundle = isOverview
    ? overviewData.bundle
    : isLeads
      ? null
      : moduleData.selectors.getProjectBundle(projectId);

  const effectiveProject = isOverview
    ? overviewData.bundle?.project || null
    : isLeads
      ? leadsData.project
      : bundle?.project || null;

  // Only this module's own request gates the content area — the shell resolves
  // its own data independently and never blocks the module.
  const isLoading = isOverview
    ? overviewData.isLoading
    : isLeads
      ? leadsData.isSummaryLoading
      : moduleData.isLoading;

  if (isLoading || !effectiveProject) {
    if (!isLoading && !effectiveProject) {
      return (
        <EmptyState
          title="Project not found."
          description="Return to the Projects Hub and choose an existing project."
          action={
            <Link
              href="/projects"
              className="mt-6 inline-flex rounded-[14px] bg-ledger-blue px-4 py-2 text-sm font-semibold text-white"
            >
              Back to Projects
            </Link>
          }
        />
      );
    }

    return module === "tasks" ? <BoardFallback /> : <CardsFallback />;
  }

  switch (module) {
    case "overview":
      return (
        <OverviewScreen
          bundle={bundle}
          recentActivity={overviewData.recentActivity}
          store={{ teamMembers: overviewData.teamMembers }}
        />
      );
    case "leads":
      return (
        <LeadsScreen
          project={effectiveProject}
          leads={leadsData.leads}
          summary={leadsData.summary}
          filterOptions={leadsData.filters}
          onStatusChange={leadsData.updateLeadStatus}
          onCreateLead={leadsData.createLead}
          onDeleteLead={leadsData.deleteLead}
          onNote={leadsData.addLeadNote}
          onOpenLead={leadsData.openLead}
          onCloseLead={leadsData.closeLead}
          selectedLead={leadsData.selectedLead}
          isLeadDetailLoading={leadsData.isLeadDetailLoading}
          isListLoading={leadsData.isListLoading}
          teamMembers={leadsData.teamMembers}
          query={leadsData.query}
          setQuery={leadsData.setQuery}
          statusFilter={leadsData.statusFilter}
          setStatusFilter={leadsData.setStatusFilter}
          sourceFilter={leadsData.sourceFilter}
          setSourceFilter={leadsData.setSourceFilter}
          assigneeFilter={leadsData.assigneeFilter}
          setAssigneeFilter={leadsData.setAssigneeFilter}
        />
      );
    case "campaigns":
      return (
        <CampaignsScreen
          bundle={bundle}
          onCreateCampaign={moduleData.createCampaign}
          onUpdateCampaign={moduleData.updateCampaign}
          onDeleteCampaign={moduleData.deleteCampaign}
        />
      );
    case "calendar":
      return (
        <CalendarScreen
          bundle={bundle}
          onCreateEvent={moduleData.createCalendarEvent}
          onUpdateEvent={moduleData.updateCalendarEvent}
          onDeleteEvent={moduleData.deleteCalendarEvent}
          store={moduleData.store}
        />
      );
    case "tasks":
      return (
        <TasksScreen
          bundle={bundle}
          onMoveTask={moduleData.updateTaskColumn}
          onCreateTask={moduleData.createTask}
          onUpdateTask={moduleData.updateTask}
          onDeleteTask={moduleData.deleteTask}
          store={moduleData.store}
        />
      );
    case "approvals":
      return (
        <ApprovalWorkbench
          bundle={bundle}
          onStatusChange={moduleData.updateApprovalStatus}
          onComment={moduleData.addApprovalComment}
          onCreateApproval={moduleData.createApproval}
          onDeleteApproval={moduleData.deleteApproval}
          store={moduleData.store}
        />
      );
    case "team":
      return (
        <ProjectTeamScreen
          bundle={bundle}
          store={moduleData.store}
          onToggleAssignment={(memberId, options) =>
            moduleData.toggleTeamMemberAssignment(projectId, memberId, options)
          }
        />
      );
    case "reports":
      return (
        <ReportsScreen bundle={bundle} onUpdateReport={moduleData.updateReportConfig} />
      );
    case "client-view":
      return <ClientViewScreen bundle={bundle} />;
    case "project-settings":
      return (
        <ProjectSettingsScreen
          bundle={bundle}
          store={moduleData.store}
          onUpdateProject={moduleData.updateProject}
        />
      );
    default:
      return <CardsFallback />;
  }
}
