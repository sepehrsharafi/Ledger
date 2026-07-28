import { Suspense } from "react";
import { OverviewSkeleton } from "@/components/Skeleton";
import OverviewScreen from "@/components/project-modules/OverviewScreen";
import { getProjectOverview } from "@/lib/data";

export default function ProjectOverviewRoute({ params }) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview params={params} />
    </Suspense>
  );
}

async function Overview({ params }) {
  const { projectId } = await params;
  const { bundle, recentActivity, teamMembers } = await getProjectOverview(projectId);

  return (
    <OverviewScreen
      bundle={bundle}
      recentActivity={recentActivity}
      store={{ teamMembers }}
    />
  );
}
