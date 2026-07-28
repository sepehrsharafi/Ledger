"use server";

import { revalidatePath } from "next/cache";
import { createRecord } from "@/backend/postgres-store";
import { makeId } from "@/lib/actions/shared";

/** Returns the new id so the hub can navigate straight into the project. */
export async function createProject(form) {
  const project = await createRecord("projects", {
    name: form.name,
    clientName: form.clientName,
    type: form.type,
    brandPrimary: form.brandPrimary,
    brandAccent: form.brandAccent,
    status: "Active",
    topKpiLabel: "Top KPI",
    topKpiValue: "--",
  });

  await createRecord("reportConfigs", {
    id: makeId("report"),
    projectId: project.id,
    includedSections: [],
    frequency: "Weekly",
    internalReviewFirst: true,
    lastSentAt: null,
    engagementStats: { opens: 0, downloads: 0, lastOpenedDate: null },
  });

  revalidatePath("/projects");
  return project.id;
}
