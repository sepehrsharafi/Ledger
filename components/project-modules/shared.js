"use client";

import { cn } from "@/lib/utils";

export const channelColors = {
  Search: "#2B58E8",
  Social: "#5B82F5",
  Email: "#14B8A6",
  Paid: "#0E1A3A",
};

export const allowedLeadStatuses = ["New", "Contacted", "Qualified", "Won", "Lost"];
export const taskColumns = ["To Do", "In Progress", "Review", "Done"];
export const reportTabs = ["Design", "Schedule", "Activity"];
export const calendarStatuses = ["Draft", "Scheduled", "Published"];
export const campaignStatuses = ["Active", "Scheduled", "Ended"];
export const marketingChannels = ["Search", "Social", "Email", "Paid"];
export const taskPriorities = ["High", "Medium", "Low"];

export const panelClassName =
  "rounded-[20px] border border-[#E4EBF7] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.035)]";
export const subtlePanelClassName =
  "rounded-[18px] border border-[#E4EBF7] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.03)]";

export function inputDateValue(value = "") {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);
}

export function isOverdueDate(date, completed = false) {
  return !completed && new Date(date) < new Date("2026-06-12");
}

export function SectionCard({ title, extra, children, className = "" }) {
  return (
    <section className={cn(panelClassName, "p-4 sm:p-6", className)}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-ledger-ink">
          {title}
        </h2>
        {extra}
      </div>
      {children}
    </section>
  );
}
