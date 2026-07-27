import ProjectModulePage from "@/components/ProjectModulePage";

export default async function ProjectApprovalsRoute({ params }) {
  const { projectId } = await params;
  return <ProjectModulePage projectId={projectId} module="approvals" />;
}
