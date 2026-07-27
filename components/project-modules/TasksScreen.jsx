"use client";

import { useState } from "react";
import EmptyState from "@/components/EmptyState";
import { Avatar, Chip, Frame, Pill } from "@/components/ui";
import {
  TaskComposerDrawer,
  TaskDetailDrawer,
} from "@/components/project-modules/TaskDrawers";
import { isOverdueDate, taskColumns } from "@/components/project-modules/shared";
import { usePageAction } from "@/context/PageAction";
import { cn, formatDate } from "@/lib/utils";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function TaskCard({ task, dragging, onOpen, onDragStart, onDragEnd }) {
  const overdue = isOverdueDate(task.dueDate, task.column === "Done");

  return (
    <div
      draggable
      role="button"
      tabIndex={0}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "cursor-pointer border border-line bg-white p-3 transition-colors hover:border-ink",
        dragging ? "opacity-50" : "",
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <span className="min-w-0 text-[13px] font-semibold leading-5 text-ink">
          {task.title}
        </span>
        <Pill tone={task.priority}>{task.priority}</Pill>
      </div>
      {task.description ? (
        <p className="mt-2 text-[11.5px] leading-5 text-muted">{task.description}</p>
      ) : null}
      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-line-soft pt-2.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <Avatar name={task.assignee} variant="outline" className="h-5 w-5" />
          <span className="label truncate">{task.assignee}</span>
        </span>
        <span
          className={cn("num shrink-0 text-[11px]", overdue ? "text-neg" : "text-muted")}
        >
          {formatDate(task.dueDate, { month: "short", day: "numeric", year: undefined })}
        </span>
      </div>
    </div>
  );
}

export default function TasksScreen({
  bundle,
  onMoveTask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  store,
}) {
  const [draggedId, setDraggedId] = useState(null);
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);

  usePageAction(() => setComposerOpen(true));

  const tasks = bundle.tasks || [];

  if (!tasks.length) {
    return (
      <EmptyState
        title="No tasks yet."
        description="Create tasks for this project to populate the delivery board."
      />
    );
  }

  const visible =
    assigneeFilter === "All"
      ? tasks
      : tasks.filter((task) => task.assignee === assigneeFilter);

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="label mr-1">Assignee</span>
          {["All", ...store.teamMembers.map((member) => member.name)].map((name) => (
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

        <div className="thin-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Frame
            className="grid-hairline min-w-[820px]"
            style={{ gridTemplateColumns: `repeat(${taskColumns.length}, minmax(0, 1fr))` }}
          >
            {taskColumns.map((column) => {
              const items = visible.filter((task) => task.column === column);

              return (
                <div
                  key={column}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const taskId =
                      event.dataTransfer.getData("text/task-id") || draggedId;
                    if (taskId) {
                      onMoveTask(taskId, column);
                    }
                    setDraggedId(null);
                  }}
                  className="min-w-0 p-3.5"
                >
                  <div className="flex items-baseline justify-between gap-2 border-b border-edge pb-2">
                    <span className="label label-ink font-semibold">{column}</span>
                    <span className="num text-[13px] font-semibold text-ink">
                      {items.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {items.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        dragging={draggedId === task.id}
                        onOpen={() => setSelectedTask({ ...task })}
                        onDragStart={(event) => {
                          setDraggedId(task.id);
                          event.dataTransfer.setData("text/task-id", task.id);
                          event.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => setDraggedId(null)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </Frame>
        </div>
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        teamMembers={store.teamMembers}
        onChange={(patch) => setSelectedTask((current) => ({ ...current, ...patch }))}
        onClose={() => setSelectedTask(null)}
        onSave={() => {
          onUpdateTask(selectedTask.id, selectedTask);
          setSelectedTask(null);
        }}
        onDelete={async () => {
          await onDeleteTask(selectedTask.id);
          setSelectedTask(null);
        }}
      />

      <TaskComposerDrawer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreate={onCreateTask}
        projectId={bundle.project.id}
        teamMembers={store.teamMembers}
      />
    </>
  );
}
