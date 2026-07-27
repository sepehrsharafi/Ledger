import ProjectModulePage from "@/components/ProjectModulePage";

export default async function ProjectTeamPage({ params }) {
  const { projectId } = await params;
  return <ProjectModulePage projectId={projectId} module="team" />;
}
