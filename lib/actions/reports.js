"use server";

import { revalidatePath } from "next/cache";
import {
  createRecord,
  deleteRecord,
  getCollectionRecords,
  updateRecord,
} from "@/backend/postgres-store";

/**
 * The screen resolves its own next config and hands over a plain object — an
 * updater function could not cross the server boundary.
 */
export async function updateReportConfig(projectId, next) {
  const configs = await getCollectionRecords("reportConfigs", { projectId });
  const current = configs[0];

  if (!current) {
    return;
  }

  await updateRecord("reportConfigs", current.id, {
    includedSections: next.includedSections,
    frequency: next.frequency,
    internalReviewFirst: next.internalReviewFirst,
    lastSentAt: next.lastSentDate,
    engagementStats: next.engagementStats,
  });

  // Only the recipients that actually changed are touched. The old client hook
  // deleted and recreated every row, which cost a round trip each on a database
  // where one query is ~800ms.
  const existing = (await getCollectionRecords("reportRecipients"))
    .filter((item) => item.reportConfigId === current.id)
    .map((item) => item.email);
  const wanted = next.recipients || [];

  for (const email of existing.filter((item) => !wanted.includes(item))) {
    await deleteRecord("reportRecipients", `${current.id}__${email}`);
  }
  for (const email of wanted.filter((item) => !existing.includes(item))) {
    await createRecord("reportRecipients", { reportConfigId: current.id, email });
  }

  revalidatePath(`/projects/${projectId}/reports`);
}
