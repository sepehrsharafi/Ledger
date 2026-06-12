import ProjectModulePage from "@/components/ProjectModulePage";

export default async function ProjectTasksRoute({ params }) {
  const { projectId } = await params;
  return <ProjectModulePage projectId={projectId} module="tasks" />;
}
