import ProjectModulePage from "@/components/ProjectModulePage";

export default async function ProjectCampaignsRoute({ params }) {
  const { projectId } = await params;
  return <ProjectModulePage projectId={projectId} module="campaigns" />;
}
