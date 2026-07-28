import { Suspense } from "react";
import { ModuleSkeleton } from "@/components/Skeleton";
import ProjectTeamScreen from "@/components/project-modules/ProjectTeamScreen";
import { toggleTeamMemberAssignment } from "@/lib/actions/team";
import { getProjectTeam } from "@/lib/data";

export default function ProjectTeamRoute({ params }) {
  return (
    <Suspense fallback={<ModuleSkeleton cards={3} rows={5} />}>
      <ProjectTeam params={params} />
    </Suspense>
  );
}

async function ProjectTeam({ params }) {
  const { projectId } = await params;
  const { project, teamMembers } = await getProjectTeam(projectId);

  return (
    <ProjectTeamScreen
      bundle={{ project }}
      store={{ teamMembers }}
      onToggleAssignment={toggleTeamMemberAssignment.bind(null, projectId)}
    />
  );
}
