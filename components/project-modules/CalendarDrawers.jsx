"use client";

import { useState } from "react";
import Drawer from "@/components/Drawer";
import { AssigneeSelect, Field } from "@/components/ui";
import {
  calendarStatuses,
  inputDateValue,
  isOverdueDate,
  marketingChannels,
} from "@/components/project-modules/shared";

/** Shared body for both the editor and the composer — same five fields. */
function EventFields({ value, onChange, teamMembers }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Title" className="sm:col-span-2">
        <input
          value={value.title}
          onChange={(event) => onChange({ title: event.target.value })}
          className="field"
        />
      </Field>
      <Field label="Channel">
        <select
          value={value.channel}
          onChange={(event) => onChange({ channel: event.target.value })}
          className="field"
        >
          {marketingChannels.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field label="Status">
        <select
          value={value.status}
          onChange={(event) => onChange({ status: event.target.value })}
          className="field"
        >
          {calendarStatuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <input
          type="date"
          value={inputDateValue(value.date)}
          onChange={(event) => onChange({ date: event.target.value })}
          className="field"
        />
      </Field>
      <Field label="Assignee">
        <AssigneeSelect
          value={value.assignee}
          onChange={(assignee) => onChange({ assignee })}
          members={teamMembers}
        />
      </Field>
    </div>
  );
}

export function EventDetailDrawer({ event, onChange, onClose, onSave, onDelete, teamMembers }) {
  if (!event) {
    return <Drawer open={false} onClose={onClose} eyebrow="Calendar item" />;
  }

  return (
    <Drawer open onClose={onClose} eyebrow="Calendar item" title={event.title}>
      <div className="space-y-5">
        <EventFields value={event} onChange={onChange} teamMembers={teamMembers} />
        {isOverdueDate(event.date, event.status === "Published") ? (
          <p className="border border-neg/30 px-3 py-2.5 text-[12.5px] text-neg">
            This calendar item is overdue.
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onDelete} className="btn btn-danger">
            Delete
          </button>
          <button
            type="button"
            disabled={!String(event.title).trim()}
            onClick={onSave}
            className="btn btn-primary"
          >
            Save item
          </button>
        </div>
      </div>
    </Drawer>
  );
}

export function EventComposerDrawer({ open, onClose, onCreate, projectId, teamMembers }) {
  const [draft, setDraft] = useState(() => emptyDraft(teamMembers));
  const isValid = draft.title.trim() && draft.date;

  function close() {
    setDraft(emptyDraft(teamMembers));
    onClose();
  }

  return (
    <Drawer open={open} onClose={close} eyebrow="New calendar item" title="New calendar item">
      <div className="space-y-5">
        <EventFields
          value={draft}
          onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          teamMembers={teamMembers}
        />
        <button
          type="button"
          disabled={!isValid}
          onClick={() => {
            onCreate(projectId, draft);
            close();
          }}
          className="btn btn-primary w-full"
        >
          Save item
        </button>
      </div>
    </Drawer>
  );
}

function emptyDraft(teamMembers = []) {
  return {
    title: "",
    channel: "Social",
    date: inputDateValue(),
    status: "Draft",
    assignee: teamMembers[0]?.name || "",
  };
}
