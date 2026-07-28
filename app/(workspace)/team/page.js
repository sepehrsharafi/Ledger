import { Suspense } from "react";
import { ModuleSkeleton } from "@/components/Skeleton";
import TeamPage from "@/components/TeamPage";
import { toggleTeamMemberAssignment } from "@/lib/actions/team";
import { getAgencyTeam } from "@/lib/data";

export default function TeamRoute() {
  return (
    <Suspense fallback={<ModuleSkeleton cards={3} rows={6} />}>
      <AgencyTeam />
    </Suspense>
  );
}

async function AgencyTeam() {
  const { projects, teamMembers } = await getAgencyTeam();

  return (
    <TeamPage
      store={{ projects, teamMembers }}
      onToggleAssignment={toggleTeamMemberAssignment}
    />
  );
}
