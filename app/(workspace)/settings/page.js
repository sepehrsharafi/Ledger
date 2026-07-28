import { Suspense } from "react";
import SettingsPage from "@/components/SettingsPage";
import { PanelsSkeleton } from "@/components/Skeleton";
import { toggleIntegration, toggleNotification } from "@/lib/actions/settings";
import { getAgencySettings } from "@/lib/data";

export default function SettingsRoute() {
  return (
    <Suspense fallback={<PanelsSkeleton panels={2} rows={4} />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const { agencySettings } = await getAgencySettings();

  return (
    <SettingsPage
      settings={agencySettings}
      onToggleIntegration={toggleIntegration}
      onToggleNotification={toggleNotification}
    />
  );
}
