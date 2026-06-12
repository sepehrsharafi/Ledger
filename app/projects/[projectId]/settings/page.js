import ProjectModulePage from "@/components/ProjectModulePage";

export default async function ProjectSettingsRoute({ params }) {
  const { projectId } = await params;
  return <ProjectModulePage projectId={projectId} module="project-settings" />;
}
