/**
 * Vocabulary shared across the project modules: the allowed values behind every
 * status control, plus the two date helpers the composers need.
 */

export const allowedLeadStatuses = ["New", "Contacted", "Qualified", "Won", "Lost"];
export const taskColumns = ["To Do", "In Progress", "Review", "Done"];
export const reportTabs = ["Design", "Schedule", "Activity"];
export const calendarStatuses = ["Draft", "Scheduled", "Published"];
export const campaignStatuses = ["Active", "Scheduled", "Ended"];
export const marketingChannels = ["Search", "Social", "Email", "Paid"];
export const taskPriorities = ["High", "Medium", "Low"];

/** Normalises any stored date into the `yyyy-mm-dd` an `<input type="date">` wants. */
export function inputDateValue(value = "") {
  const date = value ? new Date(value) : new Date();

  return Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);
}

// The demo workspace is pinned to mid-June 2026, so "today" is fixed.
const TODAY = new Date("2026-06-12");

export function isOverdueDate(date, completed = false) {
  return !completed && new Date(date) < TODAY;
}
