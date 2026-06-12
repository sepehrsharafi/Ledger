import ProjectModulePage from "@/components/ProjectModulePage";

export default async function ProjectLeadsRoute({ params }) {
  const { projectId } = await params;
  return <ProjectModulePage projectId={projectId} module="leads" />;
}
