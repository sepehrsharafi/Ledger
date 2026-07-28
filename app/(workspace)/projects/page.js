import { Suspense } from "react";
import ProjectsHubPage from "@/components/ProjectsHubPage";
import { CardGridSkeleton } from "@/components/Skeleton";
import { createProject } from "@/lib/actions/projects";
import { getProjectsHub } from "@/lib/data";

export default function ProjectsRoute() {
  return (
    <Suspense fallback={<CardGridSkeleton count={3} />}>
      <ProjectsHub />
    </Suspense>
  );
}

async function ProjectsHub() {
  const { projectCards } = await getProjectsHub();
  return <ProjectsHubPage projectCards={projectCards} onCreateProject={createProject} />;
}
