"use server";

import { revalidatePath } from "next/cache";
import { getRecord, updateRecord } from "@/backend/postgres-store";

export async function toggleIntegration(integrationId) {
  const settings = await getRecord("agencySettings", "agency");

  await updateRecord("agencySettings", "agency", {
    integrations: settings.integrations.map((item) =>
      item.id === integrationId ? { ...item, connected: !item.connected } : item,
    ),
  });

  revalidatePath("/settings");
}

export async function toggleNotification(key) {
  const settings = await getRecord("agencySettings", "agency");

  await updateRecord("agencySettings", "agency", {
    notifications: {
      ...settings.notifications,
      [key]: !settings.notifications[key],
    },
  });

  revalidatePath("/settings");
}
