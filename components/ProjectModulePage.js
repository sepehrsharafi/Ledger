"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import OverviewDashboard from "@/components/dashboard/OverviewDashboard";
import Modal from "@/components/Modal";
import Drawer from "@/components/Drawer";
import EmptyState from "@/components/EmptyState";
import { ModuleSkeleton, SkeletonBlock } from "@/components/Skeleton";
import {
  useProjectLeadsData,
  useProjectModuleData,
  useProjectOverviewData,
  useShellData,
} from "@/lib/useLedgerData";
import {
  calculateChange,
  cn,
  formatCurrency,
  formatDate,
  formatDecimal,
  formatNumber,
  monthLabel,
  toLocalDateKey,
} from "@/lib/utils";
import { useDemoLoading } from "@/lib/useDemoLoading";

const moduleTitles = {
  overview: {
    title: "Overview",
    description: "Premium project performance and operating insight.",
  },
  leads: {
    title: "Leads",
    description:
      "Project-scoped CRM, pipeline visibility, and activity tracking.",
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

const channelColors = {
  Search: "#2B58E8",
  Social: "#5B82F5",
  Email: "#14B8A6",
  Paid: "#0E1A3A",
};

const allowedLeadStatuses = ["New", "Contacted", "Qualified", "Won", "Lost"];
const taskColumns = ["To Do", "In Progress", "Review", "Done"];
const reportTabs = ["Design", "Schedule", "Activity"];
const calendarStatuses = ["Draft", "Scheduled", "Published"];
const campaignStatuses = ["Active", "Scheduled", "Ended"];
const marketingChannels = ["Search", "Social", "Email", "Paid"];
const taskPriorities = ["High", "Medium", "Low"];
const panelClassName =
  "rounded-[20px] border border-[#E4EBF7] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.035)]";
const subtlePanelClassName =
  "rounded-[18px] border border-[#E4EBF7] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.03)]";

function inputDateValue(value = "") {
  return value ? toLocalDateKey(value) : toLocalDateKey(new Date());
}

function isOverdueDate(date, completed = false) {
  return !completed && new Date(date) < new Date("2026-06-12");
}

function SectionCard({ title, extra, children, className = "" }) {
  return (
    <section className={cn(panelClassName, "p-6", className)}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-ledger-ink">
          {title}
        </h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

function KpiCard({
  label,
  value,
  previous,
  sparkline,
  formatter = (val) => formatNumber(val),
  invert = false,
}) {
  const change = calculateChange(value, previous) * (invert ? -1 : 1);
  const positive = change >= 0;

  return (
    <div className={cn(subtlePanelClassName, "p-5")}>
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
          {formatter(value)}
        </div>
        <div
          className={cn(
            "rounded-full px-3 py-1 text-sm font-semibold",
            positive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700",
          )}
        >
          {positive ? "Up" : "Down"} {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <div className="mt-5 h-14">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sparkline.map((point, index) => ({
              name: index,
              value: point,
            }))}
          >
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2B58E8"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Modal
        open={Boolean(pendingUnassign)}
        onClose={() => setPendingUnassign(null)}
        title="Unassign Team Member?"
        footer={
          <>
            <button
              onClick={() => setPendingUnassign(null)}
              className="ledger-button-secondary rounded-[14px] px-4 py-2 text-sm text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleAssignmentToggle(pendingUnassign.member.id, {
                  force: true,
                })
              }
              className="rounded-[14px] bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Unassign Anyway
            </button>
          </>
        }
      >
        {pendingUnassign ? (
          <div className="space-y-4">
            <p className="text-[15px] leading-7 text-[#5E6E90]">
              {pendingUnassign.member.name} still has {pendingUnassign.taskCount} task
              {pendingUnassign.taskCount === 1 ? "" : "s"} assigned in this
              project. Confirm before removing them from the team.
            </p>
            <div className="rounded-[18px] bg-[#F8FAFD] p-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8FA0BE]">
                Assigned Tasks
              </div>
              <div className="mt-3 space-y-2">
                {pendingUnassign.assignedTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[14px] border border-[#E4EBF7] bg-white px-3 py-3 text-sm text-ledger-ink"
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function DateRangeSelect() {
  return (
    <div className="ledger-button-secondary inline-flex h-11 items-center rounded-[14px] px-4 text-sm text-slate-600">
      May 1 - May 31, 2026
    </div>
  );
}

function OverviewScreen({ bundle, recentActivity, store }) {
  if (!bundle.series.length || !bundle.kpis) {
    return (
      <EmptyState
        title="No performance data yet."
        description="This project has no local performance snapshot yet. Add records to start populating the dashboard."
      />
    );
  }

  return (
    <OverviewDashboard
      bundle={bundle}
      recentActivity={recentActivity}
      store={store}
    />
  );
}

function LeadsScreen({
  project,
  leads,
  summary,
  filterOptions,
  onStatusChange,
  onNote,
  onUpdateLead,
  onCreateLead,
  onDeleteLead,
  onOpenLead,
  onCloseLead,
  selectedLead,
  isLeadDetailLoading,
  teamMembers,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  assigneeFilter,
  setAssigneeFilter,
}) {
  const [view, setView] = useState("table");
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [note, setNote] = useState("");
  const [leadComposerOpen, setLeadComposerOpen] = useState(false);
  const [leadDraft, setLeadDraft] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    source: "Website form",
    status: "New",
    estimatedValue: "",
    capturedFrom: "",
    assignedTeamMember: "Alex Morgan",
  });

  if (!summary.total && !leads.length) {
    return (
      <EmptyState
        title="No leads yet. Add your first lead or connect a source."
        description="New projects start empty in memory. This project will populate once local records are added."
      />
    );
  }

  const sources = ["All", ...filterOptions.sources];
  const assignedPeople = ["All", ...filterOptions.assignedPeople];
  const leadDraftIsValid =
    leadDraft.name.trim() && leadDraft.email.trim() && leadDraft.source;

  async function openLead(lead) {
    setNote("");
    await onOpenLead(lead.id);
  }

  function resetLeadDraft() {
    setLeadDraft({
      name: "",
      email: "",
      company: "",
      phone: "",
      source: "Website form",
      status: "New",
      estimatedValue: "",
      capturedFrom: "",
      assignedTeamMember: teamMembers[0]?.name || "Alex Morgan",
    });
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className={cn(subtlePanelClassName, "p-5")}>
            <div className="text-sm text-slate-500">Total Leads</div>
            <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
              {summary.total}
            </div>
          </div>
          {["New", "Contacted", "Qualified"].map((status) => (
            <div key={status} className={cn(subtlePanelClassName, "p-5")}>
              <div className="text-sm text-slate-500">{status}</div>
              <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
                {summary.statusCounts[status] || 0}
              </div>
            </div>
          ))}
          <div className={cn(subtlePanelClassName, "p-5")}>
            <div className="text-sm text-slate-500">Lead conversion rate</div>
            <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
              {summary.conversionRate.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className={cn(panelClassName, "space-y-3 p-4")}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex gap-2 rounded-[14px] bg-slate-100 p-1">
              {["table", "pipeline"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition",
                    view === mode
                      ? "bg-ledger-blue text-white"
                      : "text-slate-500",
                  )}
                >
                  {mode === "table" ? "Table View" : "Pipeline View"}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search leads..."
              className="ledger-input min-w-60 flex-1"
            />
            <button
              onClick={() => setLeadComposerOpen(true)}
              className="ledger-button ledger-button-primary min-w-37"
            >
              + New Lead
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[220px_220px_1fr]">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="ledger-select"
            >
              {["All statuses", ...allowedLeadStatuses].map((item, index) => (
                <option key={item} value={index === 0 ? "All" : item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              className="ledger-select"
            >
              {["All sources", ...sources.filter((item) => item !== "All")].map(
                (item, index) => (
                  <option key={item} value={index === 0 ? "All" : item}>
                    {item}
                  </option>
                ),
              )}
            </select>
            <div className="hidden xl:block text-[13px] text-[#8FA0BE] self-center">
              Filter by pipeline stage, source, or assignee. Click the avatar
              chips to narrow the board like a Jira filter bar.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {assignedPeople.map((name) => {
              const initials =
                name === "All"
                  ? "ALL"
                  : name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2);
              const active = assigneeFilter === name;
              return (
                <button
                  key={name}
                  onClick={() => setAssigneeFilter(name)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-semibold transition",
                    active
                      ? "border-ledger-blue bg-[#EEF4FF] text-ledger-blue"
                      : "border-[#E3EBF7] bg-white text-[#61708E] hover:border-[#C9D8F2]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold",
                      active
                        ? "bg-ledger-blue text-white"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {initials}
                  </span>
                  <span className="hidden sm:inline">{name}</span>
                </button>
              );
            })}
          </div>
        </div>
        {view === "table" ? (
          <div className={cn(panelClassName, "overflow-hidden")}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    {[
                      "Name",
                      "Company",
                      "Source",
                      "Status",
                      "Value",
                      "Assigned Team Member",
                      "Last Contacted",
                    ].map((heading) => (
                      <th key={heading} className="px-6 py-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => openLead(lead)}
                      className="cursor-pointer border-t border-slate-100 transition hover:bg-ledger-mist/40"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-ledger-ink">
                          {lead.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {lead.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {lead.company}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {lead.source}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={lead.status}>{lead.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-ledger-ink">
                        {formatCurrency(lead.estimatedValue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {lead.assignedTeamMember}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(lead.lastContactedDate, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-5">
            {allowedLeadStatuses.map((status, columnIndex) => {
              const items = leads.filter((lead) => lead.status === status);
              const columnValue = items.reduce(
                (total, lead) => total + (Number(lead.estimatedValue) || 0),
                0,
              );
              return (
                <div
                  key={status}
                  className={cn(
                    panelClassName,
                    "p-4 transition",
                    draggedLeadId ? "border-dashed" : "",
                  )}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const leadId =
                      event.dataTransfer.getData("text/lead-id") ||
                      draggedLeadId;
                    if (leadId) {
                      onStatusChange(leadId, status);
                    }
                    setDraggedLeadId(null);
                  }}
                >
                  <div className="mb-3 rounded-[18px] bg-[#F7FAFF] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold tracking-[-0.02em] text-ledger-ink">
                          {status}
                        </h3>
                        <div className="mt-1 text-[12px] text-[#7D8EA9]">
                          Drag cards here to update the pipeline.
                        </div>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#61708E]">
                        {items.length}
                      </span>
                    </div>
                    <div className="mt-3 text-[12px] text-[#7D8EA9]">
                      Pipeline value {formatCurrency(columnValue)}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {items.map((lead, leadIndex) => {
                      const member = teamMembers.find(
                        (item) => item.name === lead.assignedTeamMember,
                      );
                      const initials = lead.assignedTeamMember
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2);
                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(event) => {
                            setDraggedLeadId(lead.id);
                            event.dataTransfer.setData("text/lead-id", lead.id);
                            event.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => setDraggedLeadId(null)}
                          className={cn(
                            "cursor-pointer rounded-[18px] border border-[#E3EAF7] bg-[#FAFCFF] p-4 transition",
                            draggedLeadId === lead.id
                              ? "opacity-60 shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
                              : "hover:border-[#C9D8F2] hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)]",
                            columnIndex % 2 === 0 ? "bg-[#FBFDFF]" : "",
                          )}
                          onClick={() => openLead(lead)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openLead(lead);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold text-ledger-ink">
                                {lead.name}
                              </div>
                              <div className="mt-1 text-sm text-slate-500">
                                {lead.company}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                              <span
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                                style={{
                                  backgroundColor:
                                    member?.avatarColor || "#8FA0BE",
                                }}
                              >
                                {initials}
                              </span>
                              <span>{lead.assignedTeamMember}</span>
                            </div>
                            <span>{formatCurrency(lead.estimatedValue)}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-[#7D8EA9]">
                            <div className="rounded-xl bg-white px-3 py-2">
                              Source {lead.source}
                            </div>
                            <div className="rounded-xl bg-white px-3 py-2">
                              {lead.lastContactedDate
                                ? formatDate(lead.lastContactedDate, {
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "No contact"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Drawer
        open={Boolean(selectedLead)}
        onClose={onCloseLead}
        title={selectedLead?.name || "Lead Details"}
      >
        {selectedLead ? (
          <div className="space-y-6">
            <div className="rounded-[18px] bg-[#F5F8FF] p-5">
              <div className="text-sm text-slate-500">
                {selectedLead.company}
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <div>{selectedLead.email}</div>
                <div>{selectedLead.phone}</div>
                <div>Captured from: {selectedLead.capturedFrom}</div>
                <div>Assigned: {selectedLead.assignedTeamMember}</div>
                <div>
                  Estimated value: {formatCurrency(selectedLead.estimatedValue)}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Update Status
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {allowedLeadStatuses.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      onStatusChange(selectedLead.id, item);
                    }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      selectedLead.status === item
                        ? "border-ledger-blue bg-[#EEF4FF] text-ledger-blue"
                        : "border-[#E3EBF7] bg-white text-slate-500 hover:border-[#C9D8F2]",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Activity Timeline
              </div>
              <div className="mt-4 space-y-4">
                {(selectedLead.activities || []).map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-[16px] bg-[#F8FAFD] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-ledger-ink">
                        {activity.activityType === "Note"
                          ? "Timeline entry"
                          : activity.activityType}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(activity.timestamp, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {activity.content}
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      {activity.author}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Add Timeline Entry
              </div>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                className="ledger-textarea mt-4"
                placeholder="Capture a new timeline update..."
              />
              <button
                onClick={async () => {
                  await onNote(selectedLead.id, note);
                  setNote("");
                }}
                className="ledger-button ledger-button-primary mt-4 min-w-[140px]"
              >
                Save Entry
              </button>
            </div>
            <div className="flex justify-end border-t border-[#E6EDF8] pt-4">
              <button
                onClick={async () => {
                  await onDeleteLead(selectedLead.id);
                  onCloseLead();
                }}
                className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete Lead
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>
      <Drawer
        open={leadComposerOpen}
        onClose={() => {
          setLeadComposerOpen(false);
          resetLeadDraft();
        }}
        title="New Lead"
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Lead name", "name"],
              ["Email", "email"],
              ["Company", "company"],
              ["Phone", "phone"],
              ["Captured from", "capturedFrom"],
              ["Estimated value", "estimatedValue"],
            ].map(([label, key]) => (
              <label key={key} className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">{label}</span>
                <input
                  type={key === "estimatedValue" ? "number" : "text"}
                  min={key === "estimatedValue" ? "0" : undefined}
                  placeholder={
                    key === "estimatedValue" ? "Optional" : undefined
                  }
                  value={leadDraft[key]}
                  onChange={(event) =>
                    setLeadDraft((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className="ledger-input"
                />
              </label>
            ))}
            <label className="text-sm font-medium text-ledger-ink">
              <span className="mb-2 block">Source</span>
              <select
                value={leadDraft.source}
                onChange={(event) =>
                  setLeadDraft((current) => ({
                    ...current,
                    source: event.target.value,
                  }))
                }
                className="ledger-select"
              >
                {["Website form", "Manual", "Referral", "Paid ad", "Event"].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  ),
                )}
              </select>
            </label>
            <label className="text-sm font-medium text-ledger-ink">
              <span className="mb-2 block">Status</span>
              <select
                value={leadDraft.status}
                onChange={(event) =>
                  setLeadDraft((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                className="ledger-select"
              >
                {allowedLeadStatuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
              <span className="mb-2 block">Assigned team member</span>
              <select
                value={leadDraft.assignedTeamMember}
                onChange={(event) =>
                  setLeadDraft((current) => ({
                    ...current,
                    assignedTeamMember: event.target.value,
                  }))
                }
                className="ledger-select"
              >
                {teamMembers.map((member) => (
                  <option key={member.id}>{member.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex justify-end">
            <button
              disabled={!leadDraftIsValid}
              onClick={() => {
                if (!leadDraftIsValid) {
                  return;
                }
                onCreateLead(project.id, leadDraft);
                setLeadComposerOpen(false);
                resetLeadDraft();
              }}
              className="ledger-button ledger-button-primary min-w-[150px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Lead
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

function CampaignsScreen({
  bundle,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
}) {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [sortBy, setSortBy] = useState("spent");
  const [campaignComposerOpen, setCampaignComposerOpen] = useState(false);
  const [campaignDraft, setCampaignDraft] = useState({
    name: "",
    channel: "Paid",
    status: "Scheduled",
    startDate: inputDateValue(),
    endDate: inputDateValue(),
    budget: "",
    spent: "",
    impressions: "",
    clicks: "",
    conversions: "",
  });
  const campaignDraftIsValid =
    campaignDraft.name.trim() &&
    campaignDraft.startDate &&
    campaignDraft.endDate;

  if (!bundle.campaigns.length) {
    return (
      <EmptyState
        title="No campaigns yet."
        description="This project does not have local campaign records yet."
      />
    );
  }

  const visibleCampaigns = bundle.campaigns
    .filter((item) => statusFilter === "All" || item.status === statusFilter)
    .filter((item) => channelFilter === "All" || item.channel === channelFilter)
    .slice()
    .sort((a, b) => {
      if (sortBy === "spent") {
        return b.spent - a.spent;
      }
      if (sortBy === "conversions") {
        return b.conversions - a.conversions;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <>
      <div className="space-y-6">
        <div className={cn(panelClassName, "space-y-5 p-5")}>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-sm text-slate-500">Campaigns</div>
              <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                {visibleCampaigns.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Budget</div>
              <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                {formatCurrency(
                  visibleCampaigns.reduce((sum, item) => sum + item.budget, 0),
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Spent</div>
              <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                {formatCurrency(
                  visibleCampaigns.reduce((sum, item) => sum + item.spent, 0),
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Conversions</div>
              <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                {visibleCampaigns.reduce(
                  (sum, item) => sum + item.conversions,
                  0,
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-4 rounded-[20px] border border-[#E4EBF7] bg-[#FBFDFF] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8FA0BE]">
                    Filters
                  </div>
                  <div className="mt-1 text-[14px] text-[#6E7F9F]">
                    Channel and lifecycle filters are independent from the lead
                    board.
                  </div>
                </div>
                <div className="text-[13px] text-[#8A98B3]">
                  {visibleCampaigns.length} matching campaigns
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {["All", "Active", "Scheduled", "Ended"].map((item) => {
                    const active = statusFilter === item;
                    return (
                      <button
                        key={item}
                        onClick={() => setStatusFilter(item)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-semibold transition",
                          active
                            ? "border-ledger-blue bg-[#EEF4FF] text-ledger-blue"
                            : "border-[#E3EBF7] bg-white text-slate-500 hover:border-[#C9D8F2]",
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    "All",
                    ...new Set(bundle.campaigns.map((item) => item.channel)),
                  ].map((item) => {
                    const active = channelFilter === item;
                    return (
                      <button
                        key={item}
                        onClick={() => setChannelFilter(item)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-semibold transition",
                          active
                            ? "border-ledger-blue bg-[#EEF4FF] text-ledger-blue"
                            : "border-[#E3EBF7] bg-white text-slate-500 hover:border-[#C9D8F2]",
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="space-y-3 rounded-[20px] border border-[#E4EBF7] bg-white p-4">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="ledger-select w-full"
              >
                <option value="spent">Sort by spent</option>
                <option value="conversions">Sort by conversions</option>
                <option value="name">Sort by name</option>
              </select>
              <button
                onClick={() => setCampaignComposerOpen(true)}
                className="ledger-button ledger-button-primary w-full"
              >
                + New Campaign
              </button>
            </div>
          </div>
        </div>
        <div className={cn(panelClassName, "overflow-hidden")}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  {[
                    "Name",
                    "Channel",
                    "Status",
                    "Budget",
                    "Spent",
                    "Impressions",
                    "Clicks",
                    "Conversions",
                  ].map((heading) => (
                    <th key={heading} className="px-6 py-4">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    onClick={() => setSelectedCampaign({ ...campaign })}
                    className="cursor-pointer border-t border-slate-100 transition hover:bg-ledger-mist/40"
                  >
                    <td className="px-6 py-4 font-medium text-ledger-ink">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {campaign.channel}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={campaign.status}>{campaign.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatCurrency(campaign.budget)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatCurrency(campaign.spent)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatNumber(campaign.impressions)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatNumber(campaign.clicks)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {campaign.conversions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Drawer
        open={Boolean(selectedCampaign)}
        onClose={() => setSelectedCampaign(null)}
        title={selectedCampaign?.name || "Campaign"}
      >
        {selectedCampaign ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
                <span className="mb-2 block">Campaign name</span>
                <input
                  value={selectedCampaign.name}
                  onChange={(event) =>
                    setSelectedCampaign((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="ledger-input"
                />
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Status</span>
                <select
                  value={selectedCampaign.status}
                  onChange={(event) =>
                    setSelectedCampaign((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  className="ledger-select"
                >
                  {campaignStatuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Budget</span>
                <input
                  value={selectedCampaign.budget}
                  onChange={(event) =>
                    setSelectedCampaign((current) => ({
                      ...current,
                      budget: Number(event.target.value) || 0,
                    }))
                  }
                  className="ledger-input"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Budget", formatCurrency(selectedCampaign.budget)],
                ["Spent", formatCurrency(selectedCampaign.spent)],
                ["Clicks", formatNumber(selectedCampaign.clicks)],
                ["Conversions", selectedCampaign.conversions],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-ledger-border p-5"
                >
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[18px] border border-ledger-border p-5">
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Mini Chart
              </div>
              <div className="mt-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[1, 2, 3, 4, 5, 6].map((index) => ({
                      period: `W${index}`,
                      clicks: Math.round(
                        selectedCampaign.clicks / 8 + index * 65,
                      ),
                      conversions: Math.round(
                        selectedCampaign.conversions / 5 + index * 2,
                      ),
                    }))}
                  >
                    <CartesianGrid stroke="#e5edf9" vertical={false} />
                    <XAxis
                      dataKey="period"
                      axisLine={false}
                      tickLine={false}
                      stroke="#8b9bb8"
                    />
                    <YAxis axisLine={false} tickLine={false} stroke="#8b9bb8" />
                    <Tooltip />
                    <Bar
                      dataKey="clicks"
                      fill="#2B58E8"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="conversions"
                      fill="#14B8A6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[18px] border border-ledger-border p-5">
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Period Comparison
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[16px] bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">
                    Current period CTR
                  </div>
                  <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                    {(
                      (selectedCampaign.clicks /
                        Math.max(1, selectedCampaign.impressions)) *
                      100
                    ).toFixed(2)}
                    %
                  </div>
                </div>
                <div className="rounded-[16px] bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Spend pace</div>
                  <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                    {(
                      (selectedCampaign.spent /
                        Math.max(1, selectedCampaign.budget)) *
                      100
                    ).toFixed(0)}
                    %
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={async () => {
                  await onDeleteCampaign(selectedCampaign.id);
                  setSelectedCampaign(null);
                }}
                className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete Campaign
              </button>
              <button
                disabled={!String(selectedCampaign.name).trim()}
                onClick={() => {
                  if (!String(selectedCampaign.name).trim()) {
                    return;
                  }
                  onUpdateCampaign(selectedCampaign.id, {
                    name: selectedCampaign.name,
                    status: selectedCampaign.status,
                    budget: selectedCampaign.budget,
                  });
                  setSelectedCampaign(null);
                }}
                className="ledger-button ledger-button-primary min-w-[160px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Campaign
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>
      <Drawer
        open={campaignComposerOpen}
        onClose={() => setCampaignComposerOpen(false)}
        title="New Campaign"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Campaign name</span>
            <input
              value={campaignDraft.name}
              onChange={(event) =>
                setCampaignDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Channel</span>
            <select
              value={campaignDraft.channel}
              onChange={(event) =>
                setCampaignDraft((current) => ({
                  ...current,
                  channel: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {marketingChannels.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Status</span>
            <select
              value={campaignDraft.status}
              onChange={(event) =>
                setCampaignDraft((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {campaignStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Start date</span>
            <input
              type="date"
              value={campaignDraft.startDate}
              onChange={(event) =>
                setCampaignDraft((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">End date</span>
            <input
              type="date"
              value={campaignDraft.endDate}
              onChange={(event) =>
                setCampaignDraft((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          {["budget", "spent", "impressions", "clicks", "conversions"].map(
            (field) => (
              <label
                key={field}
                className="text-sm font-medium text-ledger-ink"
              >
                <span className="mb-2 block capitalize">{field}</span>
                <input
                  value={campaignDraft[field]}
                  onChange={(event) =>
                    setCampaignDraft((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                  className="ledger-input"
                />
              </label>
            ),
          )}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            disabled={!campaignDraftIsValid}
            onClick={() => {
              if (!campaignDraftIsValid) {
                return;
              }
              onCreateCampaign(bundle.project.id, campaignDraft);
              setCampaignComposerOpen(false);
            }}
            className="ledger-button ledger-button-primary min-w-[160px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Campaign
          </button>
        </div>
      </Drawer>
    </>
  );
}

function CalendarScreen({
  bundle,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  store,
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventComposerOpen, setEventComposerOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState({
    title: "",
    channel: "Social",
    date: inputDateValue(),
    status: "Draft",
    assignee: store.teamMembers[0]?.name || "Alex Morgan",
  });
  const eventDraftIsValid = eventDraft.title.trim() && eventDraft.date;
  const dayPreviewLimit = 2;

  if (!bundle.events.length) {
    return (
      <EmptyState
        title="No scheduled content yet."
        description="This project does not have upcoming local content events yet."
      />
    );
  }

  const baseDate = new Date("2026-06-01T00:00:00");
  const currentMonth = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + monthOffset,
    1,
  );
  const lastDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  );
  const startOffset = currentMonth.getDay();
  const days = Array.from(
    { length: startOffset + lastDay.getDate() },
    (_, index) => {
      if (index < startOffset) {
        return null;
      }
      return new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        index - startOffset + 1,
      );
    },
  );

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setEventComposerOpen(true)}
          className="ledger-button ledger-button-primary min-w-[194px]"
        >
          + Add Calendar Item
        </button>
      </div>
      <div className={cn(panelClassName, "p-6")}>
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setMonthOffset((current) => current - 1)}
            className="ledger-button-secondary rounded-[14px] px-4 py-2 text-sm text-slate-600"
          >
            Previous
          </button>
          <div className="text-lg font-semibold tracking-[-0.02em] text-ledger-ink">
            {formatDate(currentMonth, { month: "long", year: "numeric" })}
          </div>
          <button
            onClick={() => setMonthOffset((current) => current + 1)}
            className="ledger-button-secondary rounded-[14px] px-4 py-2 text-sm text-slate-600"
          >
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="px-2">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-7 gap-3">
          {days.map((day, index) => {
            const dateKey = day ? toLocalDateKey(day) : null;
            const dayEvents = bundle.events.filter(
              (event) => event.date === dateKey,
            );
            const hasMultiple = dayEvents.length > 1;
            return (
              <div
                key={index}
                className="flex min-h-[140px] flex-col rounded-[18px] border border-ledger-border bg-slate-50 p-3"
              >
                {day ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-ledger-ink">
                        {day.getDate()}
                      </div>
                    </div>
                    <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
                      {!hasMultiple
                        ? dayEvents
                            .slice(0, dayPreviewLimit)
                            .map((event) => (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent({ ...event })}
                            className="w-full rounded-[14px] px-3 py-2 text-left text-xs font-semibold text-white"
                            style={{
                              backgroundColor:
                                channelColors[event.channel] || "#2B58E8",
                            }}
                          >
                            <div>{event.title}</div>
                            <div className="mt-1 text-[11px] font-medium text-white/80">
                              {event.channel}
                            </div>
                          </button>
                          ))
                        : null}
                      {hasMultiple ? (
                        <button
                          onClick={() =>
                            setSelectedDay({
                              dateLabel: formatDate(day, {
                                month: "long",
                                day: "numeric",
                              }),
                              events: dayEvents,
                            })
                          }
                          className="mt-auto w-full rounded-[14px] border border-dashed border-[#BFD2FA] bg-white px-3 py-3 text-left text-sm font-semibold text-ledger-blue"
                        >
                          {dayEvents.length} items · View
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <Modal
        open={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        title={selectedDay?.dateLabel || "Day items"}
      >
        {selectedDay ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Select an item below to open the event editor.
            </p>
            <div className="space-y-3">
              {selectedDay.events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent({ ...event });
                    setSelectedDay(null);
                  }}
                  className="w-full rounded-[16px] border border-[#E4EBF7] bg-[#FBFDFF] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-semibold text-ledger-ink">
                        {event.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {event.channel} · {event.assignee}
                      </div>
                    </div>
                    <Badge tone={event.status}>{event.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
      <Drawer
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Event"}
      >
        {selectedEvent ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
                <span className="mb-2 block">Title</span>
                <input
                  value={selectedEvent.title}
                  onChange={(event) =>
                    setSelectedEvent((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="ledger-input"
                />
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Channel</span>
                <select
                  value={selectedEvent.channel}
                  onChange={(event) =>
                    setSelectedEvent((current) => ({
                      ...current,
                      channel: event.target.value,
                    }))
                  }
                  className="ledger-select"
                >
                  {marketingChannels.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Status</span>
                <select
                  value={selectedEvent.status}
                  onChange={(event) =>
                    setSelectedEvent((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  className="ledger-select"
                >
                  {calendarStatuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Date</span>
                <input
                  type="date"
                  value={inputDateValue(selectedEvent.date)}
                  onChange={(event) =>
                    setSelectedEvent((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  className="ledger-input"
                />
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Assignee</span>
                <select
                  value={selectedEvent.assignee}
                  onChange={(event) =>
                    setSelectedEvent((current) => ({
                      ...current,
                      assignee: event.target.value,
                    }))
                  }
                  className="ledger-select"
                >
                  {store.teamMembers.map((member) => (
                    <option key={member.id}>{member.name}</option>
                  ))}
                </select>
              </label>
            </div>
            {isOverdueDate(
              selectedEvent.date,
              selectedEvent.status === "Published",
            ) ? (
              <div className="rounded-[14px] bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                This calendar item is overdue.
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={async () => {
                  await onDeleteEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete Item
              </button>
              <button
                disabled={!String(selectedEvent.title).trim()}
                onClick={() => {
                  if (!String(selectedEvent.title).trim()) {
                    return;
                  }
                  onUpdateEvent(selectedEvent.id, selectedEvent);
                  setSelectedEvent(null);
                }}
                className="ledger-button ledger-button-primary min-w-[150px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Item
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>
      <Drawer
        open={eventComposerOpen}
        onClose={() => setEventComposerOpen(false)}
        title="New Calendar Item"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Title</span>
            <input
              value={eventDraft.title}
              onChange={(event) =>
                setEventDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Channel</span>
            <select
              value={eventDraft.channel}
              onChange={(event) =>
                setEventDraft((current) => ({
                  ...current,
                  channel: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {marketingChannels.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Status</span>
            <select
              value={eventDraft.status}
              onChange={(event) =>
                setEventDraft((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {calendarStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Date</span>
            <input
              type="date"
              value={eventDraft.date}
              onChange={(event) =>
                setEventDraft((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Assignee</span>
            <select
              value={eventDraft.assignee}
              onChange={(event) =>
                setEventDraft((current) => ({
                  ...current,
                  assignee: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {store.teamMembers.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            disabled={!eventDraftIsValid}
            onClick={() => {
              if (!eventDraftIsValid) {
                return;
              }
              onCreateEvent(bundle.project.id, eventDraft);
              setEventComposerOpen(false);
            }}
            className="ledger-button ledger-button-primary min-w-[150px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Item
          </button>
        </div>
      </Drawer>
    </>
  );
}

function TasksScreen({
  bundle,
  onMoveTask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  store,
}) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskComposerOpen, setTaskComposerOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    description: "",
    column: "To Do",
    assignee: store.teamMembers[0]?.name || "Alex Morgan",
    dueDate: inputDateValue(),
    priority: "Medium",
  });
  const taskDraftIsValid = taskDraft.title.trim() && taskDraft.dueDate;

  if (!bundle.tasks.length) {
    return (
      <EmptyState
        title="No tasks yet."
        description="Create local tasks for this project to populate the kanban board."
      />
    );
  }

  const taskAssignees = [
    "All",
    ...store.teamMembers.map((member) => member.name),
  ];
  const visibleTasks =
    assigneeFilter === "All"
      ? bundle.tasks
      : bundle.tasks.filter((task) => task.assignee === assigneeFilter);

  return (
    <>
      <div className="space-y-4">
        <div
          className={cn(
            panelClassName,
            "flex items-center justify-between gap-3 p-4",
          )}
        >
          <div>
            <div className="text-[16px] font-semibold text-ledger-ink">
              Delivery Board
            </div>
            <div className="mt-1 text-[14px] text-[#6E7F9F]">
              Create tasks, edit them in place, and drag work across the
              pipeline.
            </div>
          </div>
          <button
            onClick={() => setTaskComposerOpen(true)}
            className="ledger-button ledger-button-primary min-w-[148px]"
          >
            New Task
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {taskAssignees.map((name) => {
            const initials =
              name === "All"
                ? "ALL"
                : name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2);
            const active = assigneeFilter === name;
            return (
              <button
                key={name}
                onClick={() => setAssigneeFilter(name)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-semibold transition",
                  active
                    ? "border-ledger-blue bg-[#EEF4FF] text-ledger-blue"
                    : "border-[#E3EBF7] bg-white text-[#61708E] hover:border-[#C9D8F2]",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold",
                    active
                      ? "bg-ledger-blue text-white"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {initials}
                </span>
                <span className="hidden sm:inline">{name}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {taskColumns.map((column) => (
            <div
              key={column}
              className={cn(
                panelClassName,
                "p-4 transition",
                draggedTaskId ? "border-dashed" : "",
              )}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const taskId =
                  event.dataTransfer.getData("text/task-id") || draggedTaskId;
                if (taskId) {
                  onMoveTask(taskId, column);
                }
                setDraggedTaskId(null);
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold tracking-[-0.02em] text-ledger-ink">
                  {column}
                </h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                  {visibleTasks.filter((task) => task.column === column).length}
                </span>
              </div>
              <div className="mb-4 text-[13px] text-[#8A98B3]">
                Drag cards here or open a task to edit details.
              </div>
              <div className="space-y-3">
                {bundle.tasks
                  .filter((task) => task.column === column)
                  .filter(
                    (task) =>
                      assigneeFilter === "All" ||
                      task.assignee === assigneeFilter,
                  )
                  .map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(event) => {
                        setDraggedTaskId(task.id);
                        event.dataTransfer.setData("text/task-id", task.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDraggedTaskId(null)}
                      className={cn(
                        "cursor-pointer rounded-[16px] border border-ledger-border bg-slate-50 p-4 transition",
                        draggedTaskId === task.id
                          ? "opacity-60 shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
                          : "hover:border-[#C9D8F2]",
                      )}
                      onClick={() => setSelectedTask({ ...task })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedTask({ ...task });
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-ledger-ink">
                            {task.title}
                          </div>
                          <div className="mt-2 text-sm leading-6 text-slate-500">
                            {task.description}
                          </div>
                        </div>
                        <Badge tone={task.priority}>{task.priority}</Badge>
                      </div>
                      <div className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {task.assignee}
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-sm",
                          isOverdueDate(task.dueDate, task.column === "Done")
                            ? "font-semibold text-rose-600"
                            : "text-slate-500",
                        )}
                      >
                        {formatDate(task.dueDate, {
                          month: "short",
                          day: "numeric",
                        })}
                        {isOverdueDate(task.dueDate, task.column === "Done")
                          ? " • Overdue"
                          : ""}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Drawer
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || "Task"}
      >
        {selectedTask ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
              <span className="mb-2 block">Title</span>
              <input
                value={selectedTask.title}
                onChange={(event) =>
                  setSelectedTask((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="ledger-input"
              />
            </label>
            <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
              <span className="mb-2 block">Description</span>
              <textarea
                value={selectedTask.description}
                onChange={(event) =>
                  setSelectedTask((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                className="ledger-textarea"
              />
            </label>
            <label className="text-sm font-medium text-ledger-ink">
              <span className="mb-2 block">Stage</span>
              <select
                value={selectedTask.column}
                onChange={(event) =>
                  setSelectedTask((current) => ({
                    ...current,
                    column: event.target.value,
                  }))
                }
                className="ledger-select"
              >
                {taskColumns.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-ledger-ink">
              <span className="mb-2 block">Priority</span>
              <select
                value={selectedTask.priority}
                onChange={(event) =>
                  setSelectedTask((current) => ({
                    ...current,
                    priority: event.target.value,
                  }))
                }
                className="ledger-select"
              >
                {taskPriorities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-ledger-ink">
              <span className="mb-2 block">Due date</span>
              <input
                type="date"
                value={inputDateValue(selectedTask.dueDate)}
                onChange={(event) =>
                  setSelectedTask((current) => ({
                    ...current,
                    dueDate: event.target.value,
                  }))
                }
                className="ledger-input"
              />
            </label>
            <label className="text-sm font-medium text-ledger-ink">
              <span className="mb-2 block">Assignee</span>
              <select
                value={selectedTask.assignee}
                onChange={(event) =>
                  setSelectedTask((current) => ({
                    ...current,
                    assignee: event.target.value,
                  }))
                }
                className="ledger-select"
              >
                {store.teamMembers.map((member) => (
                  <option key={member.id}>{member.name}</option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2 flex items-center justify-between gap-3">
              <button
                onClick={async () => {
                  await onDeleteTask(selectedTask.id);
                  setSelectedTask(null);
                }}
                className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete Task
              </button>
              <button
                disabled={!String(selectedTask.title).trim()}
                onClick={() => {
                  if (!String(selectedTask.title).trim()) {
                    return;
                  }
                  onUpdateTask(selectedTask.id, selectedTask);
                  setSelectedTask(null);
                }}
                className="ledger-button ledger-button-primary min-w-[150px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Task
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={taskComposerOpen}
        onClose={() => setTaskComposerOpen(false)}
        title="New Task"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Title</span>
            <input
              value={taskDraft.title}
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Description</span>
            <textarea
              value={taskDraft.description}
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
              className="ledger-textarea"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Stage</span>
            <select
              value={taskDraft.column}
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  column: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {taskColumns.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Priority</span>
            <select
              value={taskDraft.priority}
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  priority: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {taskPriorities.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Due date</span>
            <input
              type="date"
              value={taskDraft.dueDate}
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Assignee</span>
            <select
              value={taskDraft.assignee}
              onChange={(event) =>
                setTaskDraft((current) => ({
                  ...current,
                  assignee: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {store.teamMembers.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2 flex justify-end">
            <button
              disabled={!taskDraftIsValid}
              onClick={() => {
                if (!taskDraftIsValid) return;
                onCreateTask(bundle.project.id, taskDraft);
                setTaskComposerOpen(false);
              }}
              className="ledger-button ledger-button-primary min-w-[150px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Task
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

function ApprovalsScreen({ bundle, onStatusChange, onComment }) {
  const [activeCommentId, setActiveCommentId] = useState("");
  const [draft, setDraft] = useState("");

  if (!bundle.approvals.length) {
    return (
      <EmptyState
        title="No assets waiting for review."
        description="When new local review items exist for this project, they will appear here."
      />
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {bundle.approvals.map((approval) => (
        <div key={approval.id} className={cn(panelClassName, "p-5")}>
          <div
            className="h-40 rounded-[18px]"
            style={{
              background: `linear-gradient(135deg, ${approval.thumbnailColor}, #ffffff)`,
            }}
          />
          <div className="mt-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold tracking-[-0.02em] text-ledger-ink">
                {approval.title}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {approval.submittedBy} · {formatDate(approval.submittedDate)}
              </div>
            </div>
            <Badge tone={approval.status}>{approval.status}</Badge>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge tone={approval.type}>{approval.type}</Badge>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => onStatusChange(approval.id, "Approved")}
              className="rounded-[14px] bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              onClick={() => onStatusChange(approval.id, "Rejected")}
              className="rounded-[14px] bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Reject
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {approval.comments.map((comment) => (
              <div key={comment.id} className="rounded-[16px] bg-slate-50 p-3">
                <div className="text-sm font-medium text-ledger-ink">
                  {comment.author}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {comment.message}
                </div>
              </div>
            ))}
          </div>
          <textarea
            value={activeCommentId === approval.id ? draft : ""}
            onFocus={() => setActiveCommentId(approval.id)}
            onChange={(event) => {
              setActiveCommentId(approval.id);
              setDraft(event.target.value);
            }}
            rows={3}
            placeholder="Add a comment..."
            className="ledger-textarea mt-4"
          />
          <button
            onClick={() => {
              onComment(approval.id, draft);
              setDraft("");
              setActiveCommentId("");
            }}
            className="ledger-button ledger-button-primary mt-3 h-10 px-4 text-sm"
          >
            Add Comment
          </button>
        </div>
      ))}
    </div>
  );
}

function ApprovalWorkbench({
  bundle,
  onStatusChange,
  onComment,
  onCreateApproval,
  onDeleteApproval,
  store,
}) {
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [activeCommentId, setActiveCommentId] = useState("");
  const [draft, setDraft] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [approvalDraft, setApprovalDraft] = useState({
    title: "",
    requestType: "Creative",
    submittedBy: store.teamMembers[0]?.name || "Alex Morgan",
    summary: "",
    details: "",
    pros: "",
    cons: "",
    recommendation: "",
    status: "Pending",
    thumbnailColor: "#CBD5E1",
    attachments: "Brief, mockup, and context note",
  });

  const selectedApprovalData = selectedApproval;

  const resetComposer = () =>
    setApprovalDraft({
      title: "",
      requestType: "Creative",
      submittedBy: store.teamMembers[0]?.name || "Alex Morgan",
      summary: "",
      details: "",
      pros: "",
      cons: "",
      recommendation: "",
      status: "Pending",
      thumbnailColor: "#CBD5E1",
      attachments: "Brief, mockup, and context note",
    });

  if (!bundle.approvals.length) {
    return (
      <>
        <EmptyState
          title="No assets waiting for review."
          description="When new local review items exist for this project, they will appear here."
          action={
            <button
              onClick={() => setComposerOpen(true)}
              className="ledger-button ledger-button-primary mt-6 px-4"
            >
              Request Approval
            </button>
          }
        />
        <Drawer
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          title="Request Approval"
        >
          <div className="grid gap-4 sm:grid-cols-2" />
        </Drawer>
      </>
    );
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setComposerOpen(true)}
          className="ledger-button ledger-button-primary min-w-[168px]"
        >
          Request Approval
        </button>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        {bundle.approvals.map((approval) => (
          <button
            key={approval.id}
            onClick={() => setSelectedApproval({ ...approval })}
            className={cn(
              panelClassName,
              "p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(15,23,42,0.08)]",
            )}
          >
            <div
              className="h-40 rounded-[18px]"
              style={{
                background: `linear-gradient(135deg, ${approval.thumbnailColor}, #ffffff)`,
              }}
            />
            <div className="mt-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold tracking-[-0.02em] text-ledger-ink">
                  {approval.title}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {approval.submittedBy} · {formatDate(approval.submittedDate)}
                </div>
              </div>
              <Badge tone={approval.status}>{approval.status}</Badge>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge tone={approval.type}>{approval.type}</Badge>
              {approval.requestType ? (
                <Badge>{approval.requestType}</Badge>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              {approval.summary ||
                approval.details ||
                "Open to review the full request details."}
            </p>
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(selectedApprovalData)}
        onClose={() => setSelectedApproval(null)}
        title={selectedApprovalData?.title || "Approval"}
      >
        {selectedApprovalData ? (
          <div className="space-y-5">
            <div
              className="h-44 rounded-[20px]"
              style={{
                background: `linear-gradient(135deg, ${selectedApprovalData.thumbnailColor}, #ffffff)`,
              }}
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-[#8FA0BE]">
                  Approval request
                </div>
                <div className="mt-2 text-2xl font-bold tracking-[-0.03em] text-ledger-ink">
                  {selectedApprovalData.title}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {selectedApprovalData.submittedBy} ·{" "}
                  {formatDate(selectedApprovalData.submittedDate)}
                </div>
              </div>
              <Badge tone={selectedApprovalData.status}>
                {selectedApprovalData.status}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Type", selectedApprovalData.type],
                ["Requested by", selectedApprovalData.submittedBy],
                [
                  "Request focus",
                  selectedApprovalData.requestType || "General",
                ],
                ["Attachments", selectedApprovalData.attachments || "None"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[16px] bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    {label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-ledger-ink">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[18px] border border-ledger-border p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Summary
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedApprovalData.summary || selectedApprovalData.details}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[18px] border border-ledger-border p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8FA0BE]">
                  Pros
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {selectedApprovalData.pros || "Not specified."}
                </p>
              </div>
              <div className="rounded-[18px] border border-ledger-border p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8FA0BE]">
                  Cons
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {selectedApprovalData.cons || "Not specified."}
                </p>
              </div>
            </div>
            <div className="rounded-[18px] border border-ledger-border p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Recommendation
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedApprovalData.recommendation ||
                  "No recommendation added yet."}
              </p>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Decision
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Approved", "Pending", "Rejected"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      onStatusChange(selectedApprovalData.id, item);
                      setSelectedApproval((current) =>
                        current ? { ...current, status: item } : current,
                      );
                    }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      selectedApprovalData.status === item
                        ? "border-ledger-blue bg-[#EEF4FF] text-ledger-blue"
                        : "border-[#E3EBF7] bg-white text-slate-500 hover:border-[#C9D8F2]",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Review comments
              </div>
              <div className="mt-4 space-y-3">
                {selectedApprovalData.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-[16px] bg-slate-50 p-3"
                  >
                    <div className="text-sm font-medium text-ledger-ink">
                      {comment.author}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {comment.message}
                    </div>
                  </div>
                ))}
              </div>
              <textarea
                value={activeCommentId === selectedApprovalData.id ? draft : ""}
                onFocus={() => setActiveCommentId(selectedApprovalData.id)}
                onChange={(event) => {
                  setActiveCommentId(selectedApprovalData.id);
                  setDraft(event.target.value);
                }}
                rows={3}
                placeholder="Add a comment..."
                className="ledger-textarea mt-4"
              />
              <button
                onClick={() => {
                  onComment(selectedApprovalData.id, draft);
                  setDraft("");
                  setActiveCommentId("");
                }}
                className="ledger-button ledger-button-primary mt-3 h-10 px-4 text-sm"
              >
                Add Comment
              </button>
            </div>
            <div className="flex justify-end border-t border-[#E6EDF8] pt-4">
              <button
                onClick={async () => {
                  await onDeleteApproval(selectedApprovalData.id);
                  setSelectedApproval(null);
                }}
                className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete Request
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
      <Drawer
        open={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          resetComposer();
        }}
        title="Request Approval"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Title</span>
            <input
              value={approvalDraft.title}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Type</span>
            <select
              value={approvalDraft.requestType}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  requestType: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {["Creative", "Copy", "Budget", "Strategy", "Video"].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Submitted by</span>
            <select
              value={approvalDraft.submittedBy}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  submittedBy: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {store.teamMembers.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Summary</span>
            <textarea
              value={approvalDraft.summary}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
              rows={3}
              className="ledger-textarea"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Details</span>
            <textarea
              value={approvalDraft.details}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  details: event.target.value,
                }))
              }
              rows={5}
              className="ledger-textarea"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Pros</span>
            <input
              value={approvalDraft.pros}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  pros: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Cons</span>
            <input
              value={approvalDraft.cons}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  cons: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Recommendation</span>
            <textarea
              value={approvalDraft.recommendation}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  recommendation: event.target.value,
                }))
              }
              rows={3}
              className="ledger-textarea"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => {
              if (
                !approvalDraft.title.trim() ||
                !approvalDraft.details.trim()
              ) {
                return;
              }
              onCreateApproval(bundle.project.id, approvalDraft);
              setComposerOpen(false);
              resetComposer();
            }}
            className="ledger-button ledger-button-primary min-w-[160px]"
          >
            Save Request
          </button>
        </div>
      </Drawer>
    </>
  );
}

function ReportsScreen({ bundle, onUpdateReport }) {
  const [tab, setTab] = useState("Design");
  const [recipient, setRecipient] = useState("");

  if (!bundle.reportConfig) {
    return (
      <EmptyState
        title="No report activity yet."
        description="This project has no report configuration yet."
      />
    );
  }

  const report = bundle.reportConfig;

  return (
    <div className="space-y-6">
      <div className="inline-flex gap-2 rounded-[16px] border border-[#E4EBF7] bg-white p-1 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
        {reportTabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={cn(
              "rounded-[12px] px-4 py-2 text-sm font-semibold transition",
              tab === item ? "bg-ledger-blue text-white" : "text-slate-500",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "Design" ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Included Sections">
            <div className="space-y-3">
              {[
                "Executive summary",
                "Channel performance",
                "Leads",
                "Campaign learnings",
                "Revenue",
                "Pipeline",
              ].map((section) => {
                const included = report.includedSections.includes(section);
                return (
                  <label
                    key={section}
                    className="flex items-center gap-3 rounded-[16px] border border-ledger-border px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={included}
                      onChange={() =>
                        onUpdateReport(bundle.project.id, (config) => ({
                          ...config,
                          includedSections: included
                            ? config.includedSections.filter(
                                (item) => item !== section,
                              )
                            : [...config.includedSections, section],
                        }))
                      }
                    />
                    <span className="text-sm text-ledger-ink">{section}</span>
                  </label>
                );
              })}
            </div>
          </SectionCard>
          <SectionCard title="Ordering">
            <div className="space-y-3">
              {report.includedSections.map((section, index) => (
                <div
                  key={section}
                  className="flex items-center justify-between rounded-[16px] bg-slate-50 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-ledger-ink">{section}</span>
                  <span className="text-slate-400">#{index + 1}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : null}
      {tab === "Schedule" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SectionCard title="Schedule">
            <div className="space-y-4">
              <select
                value={report.frequency}
                onChange={(event) =>
                  onUpdateReport(bundle.project.id, (config) => ({
                    ...config,
                    frequency: event.target.value,
                  }))
                }
                className="ledger-select"
              >
                {["Daily", "Weekly", "Monthly"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <label className="flex items-center justify-between rounded-[16px] border border-ledger-border px-4 py-3">
                <span className="text-sm font-medium text-ledger-ink">
                  Internal review first
                </span>
                <input
                  type="checkbox"
                  checked={report.internalReviewFirst}
                  onChange={() =>
                    onUpdateReport(bundle.project.id, (config) => ({
                      ...config,
                      internalReviewFirst: !config.internalReviewFirst,
                    }))
                  }
                />
              </label>
            </div>
          </SectionCard>
          <SectionCard title="Recipients">
            <div className="space-y-3">
              {report.recipients.map((item) => (
                <div
                  key={item}
                  className="rounded-[16px] bg-slate-50 px-4 py-3 text-sm text-ledger-ink"
                >
                  {item}
                </div>
              ))}
              <div className="flex gap-3">
                <input
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder="new@client.com"
                  className="ledger-input flex-1"
                />
                <button
                  onClick={() => {
                    if (!recipient.trim()) {
                      return;
                    }
                    onUpdateReport(bundle.project.id, (config) => ({
                      ...config,
                      recipients: [...config.recipients, recipient.trim()],
                    }));
                    setRecipient("");
                  }}
                  className="ledger-button ledger-button-primary px-4 text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : null}
      {tab === "Activity" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard title="Engagement">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Opens", report.engagementStats.opens],
                ["Downloads", report.engagementStats.downloads],
                [
                  "Last Opened",
                  report.engagementStats.lastOpenedDate
                    ? formatDate(report.engagementStats.lastOpenedDate)
                    : "Never",
                ],
                [
                  "Last Sent",
                  report.lastSentDate
                    ? formatDate(report.lastSentDate)
                    : "Never",
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[16px] bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Engagement Chart">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[1, 2, 3, 4, 5, 6].map((week) => ({
                    week: `W${week}`,
                    opens: Math.max(
                      2,
                      report.engagementStats.opens - 18 + week * 4,
                    ),
                    downloads: Math.max(
                      1,
                      report.engagementStats.downloads - 6 + week,
                    ),
                  }))}
                >
                  <CartesianGrid stroke="#e5edf9" vertical={false} />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    stroke="#8b9bb8"
                  />
                  <YAxis axisLine={false} tickLine={false} stroke="#8b9bb8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="opens"
                    stroke="#2B58E8"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="downloads"
                    stroke="#14B8A6"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}

function ClientViewScreen({ bundle }) {
  if (!bundle.series.length) {
    return (
      <EmptyState
        title="No performance data yet."
        description="This client-facing view has no local data for the selected project yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/projects/${bundle.project.id}`}
        className="inline-flex rounded-[14px] border border-[#E4EBF7] bg-white px-4 py-2 text-sm font-semibold text-ledger-blue shadow-sm"
      >
        Back to dashboard
      </Link>
      <div className="rounded-[24px] border border-[#E4EBF7] bg-white p-8 shadow-ledger">
        <div
          className="rounded-[20px] p-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${bundle.project.brandPrimary}, ${bundle.project.brandAccent})`,
          }}
        >
          <div className="text-sm uppercase tracking-[0.2em] text-white/70">
            {bundle.project.clientName}
          </div>
          <div className="mt-3 text-4xl font-bold tracking-[-0.04em]">
            {bundle.project.name}
          </div>
          <div className="mt-2 text-white/80">
            Read-only client summary for Ledger.
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[18px] bg-slate-50 p-5">
            <div className="text-sm text-slate-500">Traffic</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
              {formatNumber(bundle.kpis.traffic.current)}
            </div>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-5">
            <div className="text-sm text-slate-500">Conversions</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
              {bundle.kpis.conversions.current}
            </div>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-5">
            <div className="text-sm text-slate-500">Cost per Lead</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
              {formatCurrency(bundle.kpis.costPerLead.current)}
            </div>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-5">
            <div className="text-sm text-slate-500">ROI</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
              {bundle.kpis.roi.current.toFixed(2)}x
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Performance">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={bundle.series.map((item) => ({
                    ...item,
                    label: monthLabel(item.month),
                  }))}
                >
                  <CartesianGrid stroke="#e5edf9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    stroke="#8b9bb8"
                  />
                  <YAxis axisLine={false} tickLine={false} stroke="#8b9bb8" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="traffic"
                    stroke={bundle.project.brandAccent}
                    fill={bundle.project.brandPrimary}
                    fillOpacity={0.25}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard title="Goals">
            <div className="space-y-4">
              {bundle.goals.map((goal) => (
                <div key={goal.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ledger-ink">
                      {goal.label}
                    </span>
                    <span className="text-slate-500">
                      {goal.currentValue}/{goal.targetValue}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%`,
                        backgroundColor: bundle.project.brandAccent,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function ProjectSettingsScreen({ bundle, store, onUpdateProject }) {
  const assignedMembers = store.teamMembers.filter((member) =>
    member.assignedProjectIds.includes(bundle.project.id),
  );
  const [form, setForm] = useState({
    name: bundle.project.name,
    clientName: bundle.project.clientName,
    type: bundle.project.type,
    brandPrimary: bundle.project.brandPrimary,
    brandAccent: bundle.project.brandAccent,
    status: bundle.project.status,
  });
  const formIsValid = Object.values(form).every(
    (value) => String(value).trim().length > 0,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <SectionCard title="Project Settings">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Project name", "name"],
            ["Client name", "clientName"],
            ["Type", "type"],
            ["Status", "status"],
          ].map(([label, key]) => (
            <label
              key={key}
              className={`text-sm font-medium text-ledger-ink ${key === "type" ? "sm:col-span-2" : ""}`}
            >
              <span className="mb-2 block">{label}</span>
              <input
                value={form[key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                className="ledger-input"
              />
            </label>
          ))}
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Brand primary color</span>
            <input
              type="color"
              value={form.brandPrimary}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  brandPrimary: event.target.value,
                }))
              }
              className="h-14 w-full rounded-[14px] border border-ledger-border bg-white p-2"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Brand accent color</span>
            <input
              type="color"
              value={form.brandAccent}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  brandAccent: event.target.value,
                }))
              }
              className="h-14 w-full rounded-[14px] border border-ledger-border bg-white p-2"
            />
          </label>
        </div>
        <button
          disabled={!formIsValid}
          onClick={() => onUpdateProject(bundle.project.id, form)}
          className="ledger-button ledger-button-primary mt-6 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Project Settings
        </button>
      </SectionCard>
      <div className="space-y-6">
        <SectionCard title="Live Brand Preview">
          <div
            className="rounded-[20px] p-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${form.brandPrimary}, ${form.brandAccent})`,
            }}
          >
            <div className="text-sm uppercase tracking-[0.2em] text-white/70">
              {form.clientName}
            </div>
            <div className="mt-3 text-3xl font-bold tracking-[-0.04em]">
              {form.name}
            </div>
            <div className="mt-2 text-white/80">{form.type}</div>
          </div>
        </SectionCard>
        <SectionCard title="Assigned Team Members">
          <div className="space-y-3">
            {assignedMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-[16px] bg-slate-50 px-4 py-3"
              >
                <div className="font-semibold text-ledger-ink">
                  {member.name}
                </div>
                <div className="text-sm text-slate-500">{member.email}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function ProjectTeamScreen({ bundle, store, onToggleAssignment }) {
  const assignedMembers = store.teamMembers.filter((member) =>
    member.assignedProjectIds.includes(bundle.project.id),
  );
  const unassignedMembers = store.teamMembers.filter(
    (member) => !member.assignedProjectIds.includes(bundle.project.id),
  );
  const [pendingUnassign, setPendingUnassign] = useState(null);

  async function handleAssignmentToggle(memberId, options = {}) {
    const result = await onToggleAssignment(memberId, options);
    if (result?.status === "requires-confirmation") {
      setPendingUnassign(result);
    } else if (result?.status === "updated") {
      setPendingUnassign(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn(subtlePanelClassName, "p-5")}>
          <div className="text-sm text-slate-500">Assigned Members</div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
            {assignedMembers.length}
          </div>
        </div>
        <div className={cn(subtlePanelClassName, "p-5")}>
          <div className="text-sm text-slate-500">Available Team</div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
            {store.teamMembers.length}
          </div>
        </div>
        <div className={cn(subtlePanelClassName, "p-5")}>
          <div className="text-sm text-slate-500">Unassigned</div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
            {unassignedMembers.length}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Assigned People">
          <div className="space-y-3">
            {assignedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-[18px] border border-ledger-border px-4 py-3"
              >
                <div className="flex items-center gap-3 text-left">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-ledger-ink">
                      {member.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {member.role} · {member.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAssignmentToggle(member.id)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  Unassign
                </button>
              </div>
            ))}
            {!assignedMembers.length ? (
              <div className="rounded-[18px] bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No one is assigned to this project yet.
              </div>
            ) : null}
          </div>
        </SectionCard>
        <SectionCard title="Available People">
          <div className="space-y-3">
            {unassignedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-[18px] border border-ledger-border px-4 py-3"
              >
                <div className="flex items-center gap-3 text-left">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-ledger-ink">
                      {member.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {member.role} · {member.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAssignmentToggle(member.id)}
                  className="rounded-full border border-ledger-blue/20 bg-[#EEF4FF] px-3 py-2 text-sm font-semibold text-ledger-blue transition hover:bg-[#DDE8FF]"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default function ProjectModulePage({ projectId, module }) {
  const { projects, isLoading: isShellLoading } = useShellData();
  const shellProject = projects.find((item) => item.id === projectId) || null;
  const overviewData = useProjectOverviewData(projectId, module === "overview");
  const leadsData = useProjectLeadsData(projectId, module === "leads");
  const {
    selectors,
    store,
    isLoading: isDataLoading,
    updateLeadStatus,
    createLead,
    updateLead,
    deleteLead,
    addLeadNote,
    updateTaskColumn,
    createTask,
    updateTask,
    deleteTask,
    updateApprovalStatus,
    addApprovalComment,
    deleteApproval,
    updateReportConfig,
    updateProject,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    createApproval,
    toggleTeamMemberAssignment,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  } = useProjectModuleData(projectId, module);
  const loading = useDemoLoading(`${projectId}-${module}`);
  const moduleMeta = moduleTitles[module];
  const bundle =
    module === "overview"
      ? overviewData.bundle
      : selectors.getProjectBundle(projectId);
  const recentActivity =
    module === "overview"
      ? overviewData.recentActivity
      : selectors.getRecentProjectActivity(projectId);
  const effectiveProject =
    module === "overview"
      ? overviewData.bundle?.project || shellProject
      : module === "leads"
        ? leadsData.project || shellProject
        : bundle.project || shellProject;
  const effectiveStore =
    module === "overview"
      ? { teamMembers: overviewData.teamMembers }
      : store;
  const effectiveLoading =
    module === "overview"
      ? overviewData.isLoading || isShellLoading
      : module === "leads"
        ? leadsData.isSummaryLoading || leadsData.isListLoading || isShellLoading
        : isDataLoading || isShellLoading;

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
        onUpdateLead={leadsData.updateLead}
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
        onToggleAssignment={(memberId) =>
          toggleTeamMemberAssignment(bundle.project.id, memberId)
        }
      />
    ),
    reports: (
      <ReportsScreen bundle={bundle} onUpdateReport={updateReportConfig} />
    ),
    "project-settings": (
      <ProjectSettingsScreen
        bundle={bundle}
        store={store}
        onUpdateProject={updateProject}
      />
    ),
  };

  const shellTitle = module === "overview" ? "" : moduleMeta.title;
  const shellSubtitle = module === "overview" ? "" : moduleMeta.description;

  return (
    <AppShell
      title={shellTitle}
      subtitle={shellSubtitle}
      project={effectiveProject}
      projectSection={moduleMeta.title}
      hidePageHeading={module === "overview"}
    >
      {loading || effectiveLoading ? (
        <ModuleSkeleton
          cards={module === "tasks" ? 0 : 4}
          rows={5}
          board={module === "tasks"}
        />
      ) : (
        screens[module] || <SkeletonBlock className="h-64 w-full" />
      )}
    </AppShell>
  );
}
