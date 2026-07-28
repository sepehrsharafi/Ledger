"use server";

import { revalidatePath } from "next/cache";
import { createRecord, deleteRecord, updateRecord } from "@/backend/postgres-store";
import {
  getAuthorName,
  makeId,
  revalidateProjectChrome,
} from "@/lib/actions/shared";

function revalidateApprovals(projectId) {
  revalidatePath(`/projects/${projectId}/approvals`);
  // Pending approvals drive both the nav tally and the unread badge.
  revalidateProjectChrome(projectId);
}

export async function createApproval(projectId, payload) {
  await createRecord("approvals", {
    id: makeId("approval"),
    projectId,
    title: payload.title.trim(),
    requestType: payload.requestType,
    type: payload.requestType,
    thumbnailColor: payload.thumbnailColor || "#CBD5E1",
    status: payload.status,
    submittedBy: payload.submittedBy,
    summary: payload.summary.trim(),
    details: payload.details.trim(),
    pros: payload.pros,
    cons: payload.cons,
    attachments: payload.attachments,
    recommendation: payload.recommendation.trim(),
  });

  revalidateApprovals(projectId);
}

export async function updateApprovalStatus(projectId, approvalId, status) {
  await updateRecord("approvals", approvalId, { status });
  revalidateApprovals(projectId);
}

export async function addApprovalComment(projectId, approvalId, message) {
  if (!message.trim()) {
    return;
  }

  await createRecord("approvalComments", {
    id: makeId("comment"),
    approvalId,
    author: await getAuthorName(),
    message: message.trim(),
  });

  revalidateApprovals(projectId);
}

export async function deleteApproval(projectId, approvalId) {
  await deleteRecord("approvals", approvalId);
  revalidateApprovals(projectId);
}
