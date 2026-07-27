"use client";

import { useState } from "react";
import Badge from "@/components/Badge";
import Drawer from "@/components/Drawer";
import EmptyState from "@/components/EmptyState";
import { SkeletonBlock } from "@/components/Skeleton";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  allowedLeadStatuses,
  panelClassName,
  subtlePanelClassName,
} from "@/components/project-modules/shared";

export default function LeadsScreen({
  project,
  leads,
  summary,
  filterOptions,
  onStatusChange,
  onNote,
  onCreateLead,
  onDeleteLead,
  onOpenLead,
  onCloseLead,
  selectedLead,
  isLeadDetailLoading,
  isListLoading = false,
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
  const [isSavingNote, setIsSavingNote] = useState(false);
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

  if (!isListLoading && !summary.total && !leads.length) {
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

  async function handleSaveNote() {
    if (!selectedLead || !note.trim() || isSavingNote) {
      return;
    }

    setIsSavingNote(true);
    try {
      await onNote(selectedLead.id, note);
      setNote("");
    } finally {
      setIsSavingNote(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

        <div className={cn(panelClassName, "space-y-4 p-4")}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="grid grid-cols-2 gap-1 rounded-[14px] bg-slate-100 p-1 sm:inline-flex sm:w-auto">
              {["table", "pipeline"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition",
                    view === mode ? "bg-ledger-blue text-white" : "text-slate-500",
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
              className="ledger-input w-full xl:flex-1"
            />
            <button
              onClick={() => setLeadComposerOpen(true)}
              className="ledger-button ledger-button-primary w-full sm:w-auto"
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
            <div className="hidden self-center text-[13px] text-[#8FA0BE] xl:block">
              Filter by pipeline stage, source, or assignee. Click the avatar chips
              to narrow the board like a Jira filter bar.
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

        {isListLoading && !leads.length ? (
          <div className={cn(panelClassName, "p-5")}>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-14 w-full" />
              ))}
            </div>
          </div>
        ) : view === "table" ? (
          <div
            className={cn(
              panelClassName,
              "overflow-hidden transition-opacity",
              isListLoading ? "opacity-60" : "",
            )}
          >
            <div className="md:hidden">
              <div className="space-y-3 p-4">
                {leads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => openLead(lead)}
                    className="w-full rounded-[18px] border border-[#E3EBF7] bg-[#FBFDFF] p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-ledger-ink">{lead.name}</div>
                        <div className="mt-1 truncate text-sm text-slate-500">
                          {lead.email}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">{lead.company}</div>
                      </div>
                      <Badge tone={lead.status}>{lead.status}</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] text-[#6E7F9F]">
                      <div className="rounded-xl bg-white px-3 py-2">{lead.source}</div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        {formatCurrency(lead.estimatedValue)}
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        {lead.assignedTeamMember}
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        {formatDate(lead.lastContactedDate, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden overflow-x-auto md:block">
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
                        <div className="font-medium text-ledger-ink">{lead.name}</div>
                        <div className="text-sm text-slate-500">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{lead.company}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{lead.source}</td>
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
          <div
            className={cn(
              "grid gap-4 transition-opacity xl:grid-cols-5",
              isListLoading ? "opacity-60" : "",
            )}
          >
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
                      event.dataTransfer.getData("text/lead-id") || draggedLeadId;
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
                    {items.map((lead) => {
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
                              <div className="font-semibold text-ledger-ink">{lead.name}</div>
                              <div className="mt-1 text-sm text-slate-500">{lead.company}</div>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                                style={{ backgroundColor: member?.avatarColor || "#8FA0BE" }}
                              >
                                {initials}
                              </span>
                              <span className="truncate">{lead.assignedTeamMember}</span>
                            </div>
                            <span>{formatCurrency(lead.estimatedValue)}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-[#7D8EA9] sm:grid-cols-2">
                            <div className="rounded-xl bg-white px-3 py-2">Source {lead.source}</div>
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
        {isLeadDetailLoading && !selectedLead ? (
          <div className="text-sm text-slate-500">Loading lead details...</div>
        ) : selectedLead ? (
          <div className="space-y-6">
            <div className="rounded-[18px] bg-[#F5F8FF] p-5">
              <div className="text-sm text-slate-500">{selectedLead.company}</div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <div>{selectedLead.email}</div>
                <div>{selectedLead.phone}</div>
                <div>Captured from: {selectedLead.capturedFrom}</div>
                <div>Assigned: {selectedLead.assignedTeamMember}</div>
                <div>Estimated value: {formatCurrency(selectedLead.estimatedValue)}</div>
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
                  <div key={activity.id} className="rounded-[16px] bg-[#F8FAFD] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-ledger-ink">
                        {activity.activityType === "Note"
                          ? "Timeline entry"
                          : activity.activityType}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(activity.timestamp, { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">{activity.content}</div>
                    <div className="mt-2 text-xs text-slate-400">{activity.author}</div>
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
                disabled={isSavingNote}
              />
              <button
                onClick={handleSaveNote}
                disabled={!note.trim() || isSavingNote}
                className="ledger-button ledger-button-primary mt-4 min-w-[140px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingNote ? "Saving..." : "Save Entry"}
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
        title={`New Lead${project?.name ? ` for ${project.name}` : ""}`}
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
                  placeholder={key === "estimatedValue" ? "Optional" : undefined}
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
                {["Website form", "Manual", "Referral", "Paid ad", "Event"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
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
