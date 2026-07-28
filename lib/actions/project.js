"use server";

import { revalidatePath } from "next/cache";
import { updateRecord } from "@/backend/postgres-store";
import { revalidateProjectChrome } from "@/lib/actions/shared";

export async function updateProject(projectId, updates) {
  const { createdDate, ...rest } = updates;
  await updateRecord("projects", projectId, {
    ...rest,
    ...(createdDate === undefined ? {} : { createdAt: createdDate }),
  });

  // Identity and status show up in the chrome and the hub, not just this form.
  revalidatePath(`/projects/${projectId}/settings`);
  revalidatePath("/projects");
  revalidateProjectChrome(projectId);
}
