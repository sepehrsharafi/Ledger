"use server";

import { revalidatePath } from "next/cache";
import { createRecord, deleteRecord, updateRecord } from "@/backend/postgres-store";
import { getAuthorName, makeId, revalidateProjectChrome } from "@/lib/actions/shared";

function revalidateLeads(projectId) {
  revalidatePath(`/projects/${projectId}/leads`);
  revalidateProjectChrome(projectId);
}

async function logActivity(projectId, leadId, activityType, content) {
  await createRecord("leadActivities", {
    id: makeId("activity"),
    leadId,
    projectId,
    activityType,
    content,
    author: await getAuthorName(),
  });
}

export async function createLead(projectId, payload) {
  const estimatedValue = String(payload.estimatedValue || "").trim()
    ? Number(payload.estimatedValue)
    : null;

  const lead = await createRecord("leads", {
    id: makeId("lead"),
    projectId,
    name: payload.name.trim(),
    email: payload.email.trim(),
    company: payload.company.trim() || "Individual Customer",
    phone: payload.phone.trim() || "+1-555-0100",
    source: payload.source,
    status: payload.status,
    estimatedValue: Number.isFinite(estimatedValue) ? estimatedValue : null,
    capturedFrom: payload.capturedFrom.trim() || payload.source,
    assignedTeamMember: payload.assignedTeamMember,
  });

  await logActivity(
    projectId,
    lead.id,
    "Lead created",
    `${lead.name} was added to the pipeline.`,
  );
  revalidateLeads(projectId);
}

export async function updateLeadStatus(projectId, leadId, status) {
  await updateRecord("leads", leadId, {
    status,
    lastContactedAt: new Date().toISOString().slice(0, 10),
  });
  await logActivity(projectId, leadId, "Status change", `Lead moved to ${status}.`);
  revalidateLeads(projectId);
}

export async function addLeadNote(projectId, leadId, note) {
  if (!note.trim()) {
    return;
  }

  await logActivity(projectId, leadId, "Timeline update", note.trim());
  revalidateLeads(projectId);
}

export async function deleteLead(projectId, leadId) {
  await deleteRecord("leads", leadId);
  revalidateLeads(projectId);
}
