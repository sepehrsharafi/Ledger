"use server";

import { revalidatePath } from "next/cache";
import { createRecord, deleteRecord, updateRecord } from "@/backend/postgres-store";
import { makeId } from "@/lib/actions/shared";

function revalidateCalendar(projectId) {
  revalidatePath(`/projects/${projectId}/calendar`);
}

export async function createCalendarEvent(projectId, payload) {
  await createRecord("calendarEvents", {
    id: makeId("event"),
    projectId,
    title: payload.title.trim(),
    channel: payload.channel,
    date: payload.date,
    status: payload.status,
    assignee: payload.assignee,
  });

  revalidateCalendar(projectId);
}

export async function updateCalendarEvent(projectId, eventId, updates) {
  await updateRecord("calendarEvents", eventId, updates);
  revalidateCalendar(projectId);
}

export async function deleteCalendarEvent(projectId, eventId) {
  await deleteRecord("calendarEvents", eventId);
  revalidateCalendar(projectId);
}
