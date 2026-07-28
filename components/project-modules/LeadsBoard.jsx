"use client";

import { useState } from "react";
import LeadsScreen from "@/components/project-modules/LeadsScreen";

/**
 * Owns the leads module's view state. `LeadsScreen` is a controlled component, so
 * everything it used to get from a data hook — the four filters and which record
 * is open — lives here instead, applied to the full list the server already sent.
 *
 * Filtering is now instant: it no longer costs a request per keystroke, and
 * opening a lead no longer waits on a detail fetch because each record arrives
 * with its activity attached.
 */
export default function LeadsBoard({
  project,
  leads,
  summary,
  filters,
  teamMembers,
  onCreateLead,
  onDeleteLead,
  onStatusChange,
  onNote,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  const search = query.trim().toLowerCase();
  const visible = leads.filter((lead) => {
    const matchesQuery =
      !search ||
      [lead.name, lead.company, lead.email].join(" ").toLowerCase().includes(search);

    return (
      matchesQuery &&
      (statusFilter === "All" || lead.status === statusFilter) &&
      (sourceFilter === "All" || lead.source === sourceFilter) &&
      (assigneeFilter === "All" || lead.assignedTeamMember === assigneeFilter)
    );
  });

  return (
    <LeadsScreen
      project={project}
      leads={visible}
      summary={summary}
      filterOptions={filters}
      teamMembers={teamMembers}
      selectedLead={leads.find((lead) => lead.id === selectedLeadId) || null}
      isLeadDetailLoading={false}
      isListLoading={false}
      onOpenLead={setSelectedLeadId}
      onCloseLead={() => setSelectedLeadId(null)}
      onCreateLead={onCreateLead}
      onDeleteLead={onDeleteLead}
      onStatusChange={onStatusChange}
      onNote={onNote}
      query={query}
      setQuery={setQuery}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      sourceFilter={sourceFilter}
      setSourceFilter={setSourceFilter}
      assigneeFilter={assigneeFilter}
      setAssigneeFilter={setAssigneeFilter}
    />
  );
}
