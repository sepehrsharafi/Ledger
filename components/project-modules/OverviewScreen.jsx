"use client";

import EmptyState from "@/components/EmptyState";
import OverviewDashboard from "@/components/dashboard/OverviewDashboard";

export default function OverviewScreen({ bundle, recentActivity, store }) {
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
