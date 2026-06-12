"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import EmptyState from "@/components/EmptyState";
import { ModuleSkeleton, SkeletonBlock } from "@/components/Skeleton";
import ApprovalWorkbench from "@/components/project-modules/ApprovalWorkbench";
import CalendarScreen from "@/components/project-modules/CalendarScreen";
import CampaignsScreen from "@/components/project-modules/CampaignsScreen";
import ClientViewScreen from "@/components/project-modules/ClientViewScreen";
import LeadsScreen from "@/components/project-modules/LeadsScreen";
import OverviewScreen from "@/components/project-modules/OverviewScreen";
import ProjectSettingsScreen from "@/components/project-modules/ProjectSettingsScreen";
import ProjectTeamScreen from "@/components/project-modules/ProjectTeamScreen";
import ReportsScreen from "@/components/project-modules/ReportsScreen";
import TasksScreen from "@/components/project-modules/TasksScreen";
import {
  useProjectLeadsData,
  useProjectModuleData,
  useProjectOverviewData,
  useShellData,
} from "@/lib/useLedgerData";
import { useDemoLoading } from "@/lib/useDemoLoading";

const moduleTitles = {
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

export default function ProjectModulePage({ projectId, module }) {
  const moduleMeta = moduleTitles[module] || moduleTitles.overview;
  const shell = useShellData();
  const overviewData = useProjectOverviewData(projectId, module === "overview");
  const leadsData = useProjectLeadsData(projectId, module === "leads");
  const {
    store,
    isLoading: isDataLoading,
    selectors,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    updateTaskColumn,
    createTask,
    updateTask,
    deleteTask,
    updateApprovalStatus,
    addApprovalComment,
    createApproval,
    deleteApproval,
    toggleTeamMemberAssignment,
    updateReportConfig,
    updateProject,
  } = useProjectModuleData(projectId, module);
  const loading = useDemoLoading(`${projectId}-${module}`);

  const shellProject = shell.projects.find((item) => item.id === projectId) || null;
  const bundle =
    module === "overview"
      ? overviewData.bundle
      : module === "leads"
        ? null
        : selectors.getProjectBundle(projectId);
  const recentActivity =
    module === "overview" ? overviewData.recentActivity : selectors.getRecentProjectActivity(projectId);
  const effectiveProject =
    module === "overview"
      ? overviewData.bundle?.project || shellProject
      : module === "leads"
        ? leadsData.project || shellProject
        : bundle?.project || shellProject;
  const effectiveStore =
    module === "overview" ? { teamMembers: overviewData.teamMembers } : store;

  const effectiveLoading =
    module === "overview"
      ? overviewData.isLoading || shell.isLoading
      : module === "leads"
        ? leadsData.isSummaryLoading || leadsData.isListLoading || shell.isLoading
        : isDataLoading || shell.isLoading;

  if (!effectiveProject && !effectiveLoading) {
    return (
      <AppShell
        title="Project Not Found"
        subtitle="This project does not exist in the current in-memory workspace."
      >
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
      </AppShell>
    );
  }

  if (module === "client-view") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(91,130,245,0.12),transparent_24%)] px-4 py-8 sm:px-6 xl:px-8">
        <div className="mx-auto max-w-[1380px]">
          {loading || effectiveLoading ? (
            <ModuleSkeleton cards={4} rows={3} />
          ) : (
            <ClientViewScreen bundle={bundle} />
          )}
        </div>
      </div>
    );
  }

  const screens = {
    overview: (
      <OverviewScreen
        bundle={bundle}
        recentActivity={recentActivity}
        store={effectiveStore}
      />
    ),
    leads: (
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
    ),
    campaigns: (
      <CampaignsScreen
        bundle={bundle}
        onCreateCampaign={createCampaign}
        onUpdateCampaign={updateCampaign}
        onDeleteCampaign={deleteCampaign}
      />
    ),
    calendar: (
      <CalendarScreen
        bundle={bundle}
        onCreateEvent={createCalendarEvent}
        onUpdateEvent={updateCalendarEvent}
        onDeleteEvent={deleteCalendarEvent}
        store={store}
      />
    ),
    tasks: (
      <TasksScreen
        bundle={bundle}
        onMoveTask={updateTaskColumn}
        onCreateTask={createTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        store={store}
      />
    ),
    approvals: (
      <ApprovalWorkbench
        bundle={bundle}
        onStatusChange={updateApprovalStatus}
        onComment={addApprovalComment}
        onCreateApproval={createApproval}
        onDeleteApproval={deleteApproval}
        store={store}
      />
    ),
    team: (
      <ProjectTeamScreen
        bundle={bundle}
        store={store}
        onToggleAssignment={(memberId, options) =>
          toggleTeamMemberAssignment(bundle.project.id, memberId, options)
        }
      />
    ),
    reports: <ReportsScreen bundle={bundle} onUpdateReport={updateReportConfig} />,
    "project-settings": (
      <ProjectSettingsScreen
        bundle={bundle}
        store={store}
        onUpdateProject={updateProject}
      />
    ),
  };

  return (
    <AppShell
      title={module === "overview" ? "" : moduleMeta.title}
      subtitle={module === "overview" ? "" : moduleMeta.description}
      project={effectiveProject}
      projectSection={moduleMeta.title}
      hidePageHeading={module === "overview"}
    >
      {loading || effectiveLoading ? (
        <ModuleSkeleton cards={module === "tasks" ? 0 : 4} rows={5} board={module === "tasks"} />
      ) : (
        screens[module] || <SkeletonBlock className="h-64 w-full" />
      )}
    </AppShell>
  );
}
