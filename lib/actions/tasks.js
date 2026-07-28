"use server";

import { revalidatePath } from "next/cache";
import { createRecord, deleteRecord, updateRecord } from "@/backend/postgres-store";
import { makeId, revalidateProjectChrome } from "@/lib/actions/shared";

/**
 * Every write ends in `revalidatePath` rather than a client-side refetch: the
 * server re-renders the route and streams the new board down. That replaces the
 * old `await mutate(); await refresh()` pair, which pulled the whole module
 * snapshot back over HTTP after each change.
 */
function revalidateTasks(projectId) {
  revalidatePath(`/projects/${projectId}/tasks`);
  // The task tally and the "in review" unread badge are both sidebar chrome.
  revalidateProjectChrome(projectId);
}

/** Called by the composer drawer, which already knows the project it is in. */
export async function createTask(projectId, payload) {
  await createRecord("tasks", {
    id: makeId("task"),
    projectId,
    title: payload.title.trim(),
    description: payload.description.trim(),
    column: payload.column,
    assignee: payload.assignee,
    dueDate: payload.dueDate,
    priority: payload.priority,
    notes: payload.notes?.trim() || "",
  });

  revalidateTasks(projectId);
}

// The three below are bound to their project by the route before being handed to
// the client, so the screen keeps calling them with just the task.
export async function updateTask(projectId, taskId, updates) {
  await updateRecord("tasks", taskId, updates);
  revalidateTasks(projectId);
}

export async function deleteTask(projectId, taskId) {
  await deleteRecord("tasks", taskId);
  revalidateTasks(projectId);
}

export async function moveTask(projectId, taskId, column) {
  await updateRecord("tasks", taskId, { column });
  revalidateTasks(projectId);
}
