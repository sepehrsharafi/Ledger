import ProjectModulePage from "@/components/ProjectModulePage";

export default async function ProjectClientViewRoute({ params }) {
  const { projectId } = await params;
  return <ProjectModulePage projectId={projectId} module="client-view" />;
}
