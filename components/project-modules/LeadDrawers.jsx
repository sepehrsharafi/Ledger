"use client";

import { useState } from "react";
import Drawer from "@/components/Drawer";
import { AssigneeSelect, Chip, Field, KeyValue, Section } from "@/components/ui";
import { allowedLeadStatuses } from "@/components/project-modules/shared";
import { formatCurrency, formatDate } from "@/lib/utils";

const COMPOSER_FIELDS = [
  { key: "name", label: "Lead name" },
  { key: "email", label: "Email" },
  { key: "company", label: "Company" },
  { key: "phone", label: "Phone" },
  { key: "capturedFrom", label: "Captured from" },
  { key: "estimatedValue", label: "Estimated value", type: "number" },
];

const SOURCES = ["Website form", "Manual", "Referral", "Paid ad", "Event"];

/** Read side: identity, status control, and the activity timeline. */
export function LeadDetailDrawer({
  lead,
  isLoading,
  onClose,
  onStatusChange,
  onAddNote,
  onDelete,
}) {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveNote() {
    if (!lead || !note.trim() || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await onAddNote(lead.id, note);
      setNote("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Drawer
      open={Boolean(lead)}
      onClose={onClose}
      eyebrow="Lead"
      title={lead?.name || "Lead"}
    >
      {isLoading && !lead ? (
        <p className="text-[13px] text-muted">Loading lead details…</p>
      ) : lead ? (
        <div className="space-y-8">
          <div className="border-y border-line">
            <KeyValue label="Company">{lead.company}</KeyValue>
            <KeyValue label="Email">{lead.email}</KeyValue>
            <KeyValue label="Phone">{lead.phone}</KeyValue>
            <KeyValue label="Captured from">{lead.capturedFrom}</KeyValue>
            <KeyValue label="Owner">{lead.assignedTeamMember}</KeyValue>
            <KeyValue label="Estimated value">
              {formatCurrency(lead.estimatedValue)}
            </KeyValue>
          </div>

          <Section title="Status" bodyClassName="pt-3">
            <div className="flex flex-wrap gap-1.5">
              {allowedLeadStatuses.map((status) => (
                <Chip
                  key={status}
                  active={lead.status === status}
                  onClick={() => onStatusChange(lead.id, status)}
                >
                  {status}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Timeline">
            {(lead.activities || []).map((activity) => (
              <div key={activity.id} className="border-b border-line-soft py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-semibold text-ink">
                    {activity.activityType === "Note" ? "Note" : activity.activityType}
                  </span>
                  <span className="num shrink-0 text-[11px] text-muted">
                    {formatDate(activity.timestamp, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-5 text-ink-soft">
                  {activity.content}
                </p>
                <div className="label mt-1.5">{activity.author}</div>
              </div>
            ))}
          </Section>

          <Section title="Add timeline entry" bodyClassName="pt-3">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              className="field-area"
              placeholder="Capture a new timeline update…"
              disabled={isSaving}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={saveNote}
                disabled={!note.trim() || isSaving}
                className="btn btn-primary"
              >
                {isSaving ? "Saving…" : "Save entry"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDelete(lead.id);
                  onClose();
                }}
                className="btn btn-danger"
              >
                Delete lead
              </button>
            </div>
          </Section>
        </div>
      ) : null}
    </Drawer>
  );
}

/** Write side: the new-lead composer. */
export function LeadComposerDrawer({ open, onClose, onCreate, project, teamMembers }) {
  const [draft, setDraft] = useState(() => emptyDraft(teamMembers));
  const isValid = draft.name.trim() && draft.email.trim() && draft.source;

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function close() {
    setDraft(emptyDraft(teamMembers));
    onClose();
  }

  return (
    <Drawer open={open} onClose={close} eyebrow="New lead" title="New lead">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {COMPOSER_FIELDS.map((field) => (
            <Field key={field.key} label={field.label}>
              <input
                type={field.type || "text"}
                min={field.type === "number" ? "0" : undefined}
                value={draft[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
                className="field"
              />
            </Field>
          ))}
          <Field label="Source">
            <select
              value={draft.source}
              onChange={(event) => update("source", event.target.value)}
              className="field"
            >
              {SOURCES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={draft.status}
              onChange={(event) => update("status", event.target.value)}
              className="field"
            >
              {allowedLeadStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Owner" className="sm:col-span-2">
            <AssigneeSelect
              value={draft.assignedTeamMember}
              onChange={(name) => update("assignedTeamMember", name)}
              members={teamMembers}
            />
          </Field>
        </div>
        <button
          type="button"
          disabled={!isValid}
          onClick={() => {
            onCreate(project.id, draft);
            close();
          }}
          className="btn btn-primary w-full"
        >
          Save lead
        </button>
      </div>
    </Drawer>
  );
}

function emptyDraft(teamMembers = []) {
  return {
    name: "",
    email: "",
    company: "",
    phone: "",
    source: "Website form",
    status: "New",
    estimatedValue: "",
    capturedFrom: "",
    assignedTeamMember: teamMembers[0]?.name || "",
  };
}
