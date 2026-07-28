"use client";

import { useState } from "react";
import Drawer from "@/components/Drawer";
import { AssigneeSelect, Field, Spinner } from "@/components/ui";
import { usePendingAction } from "@/lib/usePendingAction";
import {
  inputDateValue,
  taskColumns,
  taskPriorities,
} from "@/components/project-modules/shared";

/** Shared body for the task editor and composer. */
function TaskFields({ value, onChange, teamMembers }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Title" className="sm:col-span-2">
        <input
          value={value.title}
          onChange={(event) => onChange({ title: event.target.value })}
          className="field"
        />
      </Field>
      <Field label="Description" className="sm:col-span-2">
        <textarea
          value={value.description}
          onChange={(event) => onChange({ description: event.target.value })}
          rows={4}
          className="field-area"
        />
      </Field>
      <Field label="Stage">
        <select
          value={value.column}
          onChange={(event) => onChange({ column: event.target.value })}
          className="field"
        >
          {taskColumns.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field label="Priority">
        <select
          value={value.priority}
          onChange={(event) => onChange({ priority: event.target.value })}
          className="field"
        >
          {taskPriorities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field label="Due date">
        <input
          type="date"
          value={inputDateValue(value.dueDate)}
          onChange={(event) => onChange({ dueDate: event.target.value })}
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

export function TaskDetailDrawer({ task, onChange, onClose, onSave, onDelete, teamMembers }) {
  const action = usePendingAction();
  const busy = action.isPending;

  if (!task) {
    return <Drawer open={false} onClose={onClose} eyebrow="Task" />;
  }

  return (
    <Drawer open onClose={onClose} eyebrow="Task" title={task.title}>
      <div className="space-y-5">
        <TaskFields value={task} onChange={onChange} teamMembers={teamMembers} />
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => action.run("delete", onDelete)}
            className="btn btn-danger inline-flex items-center gap-1.5"
          >
            {action.pendingKey === "delete" ? <Spinner /> : null}
            {action.pendingKey === "delete" ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            disabled={busy || !String(task.title).trim()}
            onClick={() => action.run("save", onSave)}
            className="btn btn-primary inline-flex items-center gap-1.5"
          >
            {action.pendingKey === "save" ? <Spinner /> : null}
            {action.pendingKey === "save" ? "Saving…" : "Save task"}
          </button>
        </div>
      </div>
    </Drawer>
  );
}

export function TaskComposerDrawer({ open, onClose, onCreate, projectId, teamMembers }) {
  const action = usePendingAction();
  const [draft, setDraft] = useState(() => emptyDraft(teamMembers));
  const isValid = draft.title.trim() && draft.dueDate;

  function close() {
    setDraft(emptyDraft(teamMembers));
    onClose();
  }

  return (
    <Drawer open={open} onClose={close} eyebrow="New task" title="New task">
      <div className="space-y-5">
        <TaskFields
          value={draft}
          onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          teamMembers={teamMembers}
        />
        <button
          type="button"
          disabled={!isValid || action.isPending}
          onClick={() =>
            action.run("create", async () => {
              await onCreate(projectId, draft);
              close();
            })
          }
          className="btn btn-primary inline-flex w-full items-center justify-center gap-1.5"
        >
          {action.isPending ? <Spinner /> : null}
          {action.isPending ? "Creating…" : "Save task"}
        </button>
      </div>
    </Drawer>
  );
}

function emptyDraft(teamMembers = []) {
  return {
    title: "",
    description: "",
    column: "To Do",
    assignee: teamMembers[0]?.name || "",
    dueDate: inputDateValue(),
    priority: "Medium",
  };
}
