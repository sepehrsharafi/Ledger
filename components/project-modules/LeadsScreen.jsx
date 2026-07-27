"use client";

import { useState } from "react";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import {
  Avatar,
  Cell,
  Chip,
  Frame,
  Pill,
  Row,
  Segmented,
  StatStrip,
  Table,
} from "@/components/ui";
import {
  LeadComposerDrawer,
  LeadDetailDrawer,
} from "@/components/project-modules/LeadDrawers";
import { allowedLeadStatuses } from "@/components/project-modules/shared";
import { usePageAction } from "@/context/PageAction";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const VIEWS = [
  { value: "table", label: "Table" },
  { value: "pipeline", label: "Pipeline" },
];

const COLUMNS = [
  { key: "lead", label: "Lead" },
  { key: "source", label: "Source" },
  { key: "status", label: "Status" },
  { key: "value", label: "Value", align: "right" },
  { key: "owner", label: "Owner" },
  { key: "contact", label: "Last contact", align: "right" },
];

const shortDate = (value) =>
  value ? formatDate(value, { month: "short", day: "numeric", year: undefined }) : "—";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function LeadTable({ leads, onOpen }) {
  return (
    <>
      {/* Cards below the table's minimum width — the same data, stacked. */}
      <div className="md:hidden">
        {leads.map((lead) => (
          <button
            key={lead.id}
            type="button"
            onClick={() => onOpen(lead)}
            className="w-full border-b border-line-soft py-3.5 text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-ink">
                  {lead.name}
                </span>
                <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                  {lead.email}
                </span>
              </span>
              <Pill tone={lead.status}>{lead.status}</Pill>
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <span className="label truncate">{lead.source}</span>
              <span className="num shrink-0 text-[12px] text-ink">
                {formatCurrency(lead.estimatedValue)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="hidden md:block">
        <Table columns={COLUMNS}>
          {leads.map((lead) => (
            <Row key={lead.id} onClick={() => onOpen(lead)}>
              <Cell>
                <div className="text-[13px] font-semibold text-ink">{lead.name}</div>
                <div className="mt-0.5 text-[11.5px] text-muted">{lead.email}</div>
              </Cell>
              <Cell>{lead.source}</Cell>
              <Cell>
                <Pill tone={lead.status}>{lead.status}</Pill>
              </Cell>
              <Cell align="right" className="num text-ink">
                {formatCurrency(lead.estimatedValue)}
              </Cell>
              <Cell>
                <span className="flex items-center gap-2">
                  <Avatar
                    name={lead.assignedTeamMember}
                    variant="outline"
                    className="h-5 w-5"
                  />
                  <span className="truncate">{lead.assignedTeamMember}</span>
                </span>
              </Cell>
              <Cell align="right" className="num text-muted">
                {shortDate(lead.lastContactedDate)}
              </Cell>
            </Row>
          ))}
        </Table>
      </div>
    </>
  );
}

function LeadBoard({ leads, onOpen, onStatusChange }) {
  const [draggedId, setDraggedId] = useState(null);

  return (
    <div className="thin-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <Frame
        className="grid-hairline min-w-[900px]"
        style={{ gridTemplateColumns: `repeat(${allowedLeadStatuses.length}, minmax(0, 1fr))` }}
      >
        {allowedLeadStatuses.map((status) => {
          const items = leads.filter((lead) => lead.status === status);
          const total = items.reduce(
            (sum, lead) => sum + (Number(lead.estimatedValue) || 0),
            0,
          );

          return (
            <div
              key={status}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const leadId = event.dataTransfer.getData("text/lead-id") || draggedId;
                if (leadId) {
                  onStatusChange(leadId, status);
                }
                setDraggedId(null);
              }}
              className="min-w-0 p-3.5"
            >
              <div className="flex items-baseline justify-between gap-2 border-b border-edge pb-2">
                <span className="label label-ink font-semibold">{status}</span>
                <span className="num text-[13px] font-semibold text-ink">
                  {items.length}
                </span>
              </div>
              <div className="num pt-1.5 text-[11px] text-muted">
                {formatCurrency(total)}
              </div>

              <div className="mt-3 space-y-2.5">
                {items.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    role="button"
                    tabIndex={0}
                    onDragStart={(event) => {
                      setDraggedId(lead.id);
                      event.dataTransfer.setData("text/lead-id", lead.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    onClick={() => onOpen(lead)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpen(lead);
                      }
                    }}
                    className={cn(
                      "cursor-pointer border border-line bg-white p-3 transition-colors hover:border-ink",
                      draggedId === lead.id ? "opacity-50" : "",
                    )}
                  >
                    <div className="truncate text-[13px] font-semibold text-ink">
                      {lead.name}
                    </div>
                    <div className="mt-0.5 truncate text-[11.5px] text-muted">
                      {lead.source}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Avatar
                        name={lead.assignedTeamMember}
                        variant="outline"
                        className="h-5 w-5"
                      />
                      <span className="num text-[12px] text-ink">
                        {formatCurrency(lead.estimatedValue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </Frame>
    </div>
  );
}

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
  const [composerOpen, setComposerOpen] = useState(false);

  usePageAction(() => setComposerOpen(true));

  // The data layer keys lead detail by id; rows hand over the whole record.
  const openLead = (lead) => onOpenLead(lead.id);

  if (!isListLoading && !summary.total && !leads.length) {
    return (
      <EmptyState
        title="No leads yet."
        description="Add the first lead or connect a source to start populating this pipeline."
      />
    );
  }

  const stats = [
    { label: "Total", value: summary.total },
    ...["New", "Contacted", "Qualified"].map((status) => ({
      label: status,
      value: summary.statusCounts[status] || 0,
    })),
    { label: "Conversion", value: `${summary.conversionRate.toFixed(1)}%` },
  ];

  return (
    <>
      <div className="space-y-7">
        <StatStrip items={stats} />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Segmented options={VIEWS} value={view} onChange={setView} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search leads"
            aria-label="Search leads"
            className="field lg:max-w-[220px]"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
            className="field lg:max-w-[150px]"
          >
            <option value="All">All statuses</option>
            {allowedLeadStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            aria-label="Filter by source"
            className="field lg:max-w-[150px]"
          >
            <option value="All">All sources</option>
            {filterOptions.sources.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-1.5 lg:ml-auto">
            <span className="label mr-1">Owner</span>
            {["All", ...filterOptions.assignedPeople].map((name) => (
              <Chip
                key={name}
                active={assigneeFilter === name}
                onClick={() => setAssigneeFilter(name)}
                title={name}
              >
                {name === "All" ? "All" : initials(name)}
              </Chip>
            ))}
          </div>
        </div>

        {isListLoading && !leads.length ? (
          <TableSkeleton rows={8} />
        ) : (
          <div className={isListLoading ? "opacity-60 transition-opacity" : ""}>
            {view === "table" ? (
              <LeadTable leads={leads} onOpen={openLead} />
            ) : (
              <LeadBoard
                leads={leads}
                onOpen={openLead}
                onStatusChange={onStatusChange}
              />
            )}
          </div>
        )}
      </div>

      <LeadDetailDrawer
        lead={selectedLead}
        isLoading={isLeadDetailLoading}
        onClose={onCloseLead}
        onStatusChange={onStatusChange}
        onAddNote={onNote}
        onDelete={onDeleteLead}
      />

      <LeadComposerDrawer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreate={onCreateLead}
        project={project}
        teamMembers={teamMembers}
      />
    </>
  );
}
