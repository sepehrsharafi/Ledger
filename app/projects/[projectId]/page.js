import ProjectModulePage from "@/components/ProjectModulePage";

export default async function ProjectOverviewRoute({ params }) {
  const { projectId } = await params;
  return <ProjectModulePage projectId={projectId} module="overview" />;
}
