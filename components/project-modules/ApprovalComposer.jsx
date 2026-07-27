"use client";

import { useState } from "react";
import Drawer from "@/components/Drawer";
import { Field } from "@/components/ui";
import { SERIES } from "@/lib/palette";

const REQUEST_TYPES = ["Creative", "Copy", "Budget", "Strategy", "Video"];

const TEXT_AREAS = [
  { key: "summary", label: "Summary", rows: 3 },
  { key: "details", label: "Details", rows: 5 },
  { key: "recommendation", label: "Recommendation", rows: 3 },
];

export default function ApprovalComposer({
  open,
  onClose,
  onCreate,
  projectId,
  teamMembers,
}) {
  const [draft, setDraft] = useState(() => emptyDraft(teamMembers));
  const isValid = draft.title.trim() && draft.details.trim();

  function update(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function close() {
    setDraft(emptyDraft(teamMembers));
    onClose();
  }

  return (
    <Drawer open={open} onClose={close} eyebrow="Request approval" title="Request approval">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <input
              value={draft.title}
              onChange={(event) => update({ title: event.target.value })}
              className="field"
            />
          </Field>
          <Field label="Type">
            <select
              value={draft.requestType}
              onChange={(event) => update({ requestType: event.target.value })}
              className="field"
            >
              {REQUEST_TYPES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Submitted by">
            <select
              value={draft.submittedBy}
              onChange={(event) => update({ submittedBy: event.target.value })}
              className="field"
            >
              {teamMembers.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>
          </Field>
          {TEXT_AREAS.map((field) => (
            <Field key={field.key} label={field.label} className="sm:col-span-2">
              <textarea
                value={draft[field.key]}
                onChange={(event) => update({ [field.key]: event.target.value })}
                rows={field.rows}
                className="field-area"
              />
            </Field>
          ))}
          <Field label="For">
            <input
              value={draft.pros}
              onChange={(event) => update({ pros: event.target.value })}
              className="field"
            />
          </Field>
          <Field label="Against">
            <input
              value={draft.cons}
              onChange={(event) => update({ cons: event.target.value })}
              className="field"
            />
          </Field>
        </div>
        <button
          type="button"
          disabled={!isValid}
          onClick={() => {
            onCreate(projectId, draft);
            close();
          }}
          className="btn btn-primary w-full"
        >
          Save request
        </button>
      </div>
    </Drawer>
  );
}

function emptyDraft(teamMembers = []) {
  return {
    title: "",
    requestType: "Creative",
    submittedBy: teamMembers[0]?.name || "Alex Morgan",
    summary: "",
    details: "",
    pros: "",
    cons: "",
    recommendation: "",
    status: "Pending",
    thumbnailColor: SERIES.pale,
    attachments: "Brief, mockup, and context note",
  };
}
