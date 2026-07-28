"use server";

import { revalidatePath } from "next/cache";
import { createRecord, deleteRecord, updateRecord } from "@/backend/postgres-store";
import {
  getAuthorName,
  makeId,
  revalidateProjectChrome,
} from "@/lib/actions/shared";

function revalidateCampaigns(projectId) {
  revalidatePath(`/projects/${projectId}/campaigns`);
  revalidateProjectChrome(projectId);
}

export async function createCampaign(projectId, payload) {
  await createRecord("campaigns", {
    id: makeId("campaign"),
    projectId,
    name: payload.name.trim(),
    channel: payload.channel,
    status: payload.status,
    startDate: payload.startDate,
    endDate: payload.endDate,
    budget: Number(payload.budget) || 0,
    spent: Number(payload.spent) || 0,
    impressions: Number(payload.impressions) || 0,
    clicks: Number(payload.clicks) || 0,
    conversions: Number(payload.conversions) || 0,
    owner: payload.owner || (await getAuthorName()),
    notes: payload.notes?.trim() || "",
  });

  revalidateCampaigns(projectId);
}

export async function updateCampaign(projectId, campaignId, updates) {
  await updateRecord("campaigns", campaignId, updates);
  revalidateCampaigns(projectId);
}

export async function deleteCampaign(projectId, campaignId) {
  await deleteRecord("campaigns", campaignId);
  revalidateCampaigns(projectId);
}
