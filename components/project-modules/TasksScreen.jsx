"use client";

import { useState } from "react";
import Badge from "@/components/Badge";
import Drawer from "@/components/Drawer";
import EmptyState from "@/components/EmptyState";
import { cn, formatDate } from "@/lib/utils";
import {
  inputDateValue,
  isOverdueDate,
  panelClassName,
  taskColumns,
  taskPriorities,
} from "@/components/project-modules/shared";

export default function TasksScreen({
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

  const taskAssignees = ["All", ...store.teamMembers.map((member) => member.name)];
  const visibleTasks =
    assigneeFilter === "All"
      ? bundle.tasks
      : bundle.tasks.filter((task) => task.assignee === assigneeFilter);

  return (
    <>
      <div className="space-y-4">
        <div className={cn(panelClassName, "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between")}>
          <div>
            <div className="text-[16px] font-semibold text-ledger-ink">Delivery Board</div>
            <div className="mt-1 text-[14px] text-[#6E7F9F]">
              Create tasks, edit them in place, and drag work across the pipeline.
            </div>
          </div>
          <button
            onClick={() => setTaskComposerOpen(true)}
            className="ledger-button ledger-button-primary w-full sm:w-auto"
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
                    active ? "bg-ledger-blue text-white" : "bg-slate-100 text-slate-500",
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
              className={cn(panelClassName, "p-4 transition", draggedTaskId ? "border-dashed" : "")}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData("text/task-id") || draggedTaskId;
                if (taskId) {
                  onMoveTask(taskId, column);
                }
                setDraggedTaskId(null);
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold tracking-[-0.02em] text-ledger-ink">{column}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                  {visibleTasks.filter((task) => task.column === column).length}
                </span>
              </div>
              <div className="mb-4 text-[13px] text-[#8A98B3]">
                Drag cards here or open a task to edit details.
              </div>
              <div className="space-y-3">
                {visibleTasks
                  .filter((task) => task.column === column)
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
                          <div className="font-semibold text-ledger-ink">{task.title}</div>
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
                        {formatDate(task.dueDate, { month: "short", day: "numeric" })}
                        {isOverdueDate(task.dueDate, task.column === "Done") ? " • Overdue" : ""}
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
                  setSelectedTask((current) => ({ ...current, title: event.target.value }))
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
                  setSelectedTask((current) => ({ ...current, column: event.target.value }))
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
                  setSelectedTask((current) => ({ ...current, priority: event.target.value }))
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
                  setSelectedTask((current) => ({ ...current, dueDate: event.target.value }))
                }
                className="ledger-input"
              />
            </label>
            <label className="text-sm font-medium text-ledger-ink">
              <span className="mb-2 block">Assignee</span>
              <select
                value={selectedTask.assignee}
                onChange={(event) =>
                  setSelectedTask((current) => ({ ...current, assignee: event.target.value }))
                }
                className="ledger-select"
              >
                {store.teamMembers.map((member) => (
                  <option key={member.id}>{member.name}</option>
                ))}
              </select>
            </label>
            <div className="flex items-center justify-between gap-3 sm:col-span-2">
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
                setTaskDraft((current) => ({ ...current, title: event.target.value }))
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
                setTaskDraft((current) => ({ ...current, column: event.target.value }))
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
                setTaskDraft((current) => ({ ...current, priority: event.target.value }))
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
                setTaskDraft((current) => ({ ...current, dueDate: event.target.value }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Assignee</span>
            <select
              value={taskDraft.assignee}
              onChange={(event) =>
                setTaskDraft((current) => ({ ...current, assignee: event.target.value }))
              }
              className="ledger-select"
            >
              {store.teamMembers.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>
          </label>
          <div className="flex justify-end sm:col-span-2">
            <button
              disabled={!taskDraftIsValid}
              onClick={() => {
                if (!taskDraftIsValid) {
                  return;
                }
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
