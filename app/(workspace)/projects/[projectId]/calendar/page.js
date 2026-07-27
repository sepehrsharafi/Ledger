import ProjectModulePage from "@/components/ProjectModulePage";

export default async function ProjectCalendarRoute({ params }) {
  const { projectId } = await params;
  return <ProjectModulePage projectId={projectId} module="calendar" />;
}
