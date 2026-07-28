import { Suspense } from "react";
import { PanelsSkeleton } from "@/components/Skeleton";
import ProjectSettingsScreen from "@/components/project-modules/ProjectSettingsScreen";
import { updateProject } from "@/lib/actions/project";
import { getProjectSettings } from "@/lib/data";

export default function ProjectSettingsRoute({ params }) {
  return (
    <Suspense fallback={<PanelsSkeleton panels={2} rows={4} />}>
      <ProjectSettings params={params} />
    </Suspense>
  );
}

async function ProjectSettings({ params }) {
  const { projectId } = await params;
  const { project, teamMembers } = await getProjectSettings(projectId);

  return (
    <ProjectSettingsScreen
      bundle={{ project }}
      store={{ teamMembers }}
      onUpdateProject={updateProject}
    />
  );
}
