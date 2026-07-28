import { Suspense } from "react";
import { PanelsSkeleton } from "@/components/Skeleton";
import ReportsScreen from "@/components/project-modules/ReportsScreen";
import { updateReportConfig } from "@/lib/actions/reports";
import { getProjectReports } from "@/lib/data";

export default function ProjectReportsRoute({ params }) {
  return (
    <Suspense fallback={<PanelsSkeleton panels={2} rows={4} />}>
      <Reports params={params} />
    </Suspense>
  );
}

async function Reports({ params }) {
  const { projectId } = await params;
  const { project, reportConfig } = await getProjectReports(projectId);

  return (
    <ReportsScreen
      bundle={{ project, reportConfig }}
      onUpdateReport={updateReportConfig.bind(null, projectId)}
    />
  );
}
