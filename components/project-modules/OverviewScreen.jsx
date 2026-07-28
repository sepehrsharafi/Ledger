"use client";

import EmptyState from "@/components/EmptyState";
import OverviewDashboard from "@/components/dashboard/OverviewDashboard";
import { usePageAction } from "@/context/PageAction";
import {
  buildOverviewCsv,
  downloadCsv,
  overviewCsvFilename,
} from "@/lib/exportReport";

export default function OverviewScreen({ bundle, recentActivity, store }) {
  // Claims the header's "Export report" button while this screen is mounted.
  usePageAction(() => {
    if (!bundle?.series?.length) {
      return;
    }
    downloadCsv(overviewCsvFilename(bundle), buildOverviewCsv(bundle));
  });

  if (!bundle?.series?.length) {
    return (
      <EmptyState
        title="No performance data yet."
        description="This project has no local performance snapshot yet. Add records to start populating the dashboard."
      />
    );
  }

  return (
    <OverviewDashboard
      bundle={bundle}
      recentActivity={recentActivity}
      store={store}
    />
  );
}
