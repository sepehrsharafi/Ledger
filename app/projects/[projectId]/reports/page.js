import ProjectModulePage from "@/components/ProjectModulePage";

export default async function ProjectReportsRoute({ params }) {
  const { projectId } = await params;
  return <ProjectModulePage projectId={projectId} module="reports" />;
}
