import { cache } from "react";
import {
  getAgencySettingsView,
  getAgencyTeamView,
  getAppShellView,
  getProjectApprovalsView,
  getProjectCalendarView,
  getProjectCampaignsView,
  getProjectClientView,
  getProjectLeadsView,
  getProjectOverviewView,
  getProjectReportsView,
  getProjectSettingsView,
  getProjectsHubView,
  getProjectTasksView,
  getProjectTeamView,
} from "@/backend/project-views";

/**
 * The server's read layer. Server components call these directly instead of
 * fetching their own `/api` routes — one less network hop on a database where a
 * warm query already costs ~800ms.
 *
 * `cache()` dedupes within a single render, so two components asking for the
 * same view share one query rather than issuing two.
 */
export const getAppShell = cache(getAppShellView);
export const getProjectsHub = cache(getProjectsHubView);
export const getAgencyTeam = cache(getAgencyTeamView);
export const getAgencySettings = cache(getAgencySettingsView);
export const getProjectOverview = cache(getProjectOverviewView);
export const getProjectLeads = cache(getProjectLeadsView);
export const getProjectTasks = cache(getProjectTasksView);
export const getProjectCampaigns = cache(getProjectCampaignsView);
export const getProjectCalendar = cache(getProjectCalendarView);
export const getProjectTeam = cache(getProjectTeamView);
export const getProjectApprovals = cache(getProjectApprovalsView);
export const getProjectReports = cache(getProjectReportsView);
export const getProjectClient = cache(getProjectClientView);
export const getProjectSettings = cache(getProjectSettingsView);
