import { Suspense } from "react";
import { ModuleSkeleton } from "@/components/Skeleton";
import LeadsBoard from "@/components/project-modules/LeadsBoard";
import {
  addLeadNote,
  createLead,
  deleteLead,
  updateLeadStatus,
} from "@/lib/actions/leads";
import { getProjectLeads } from "@/lib/data";

export default function ProjectLeadsRoute({ params }) {
  return (
    <Suspense fallback={<ModuleSkeleton cards={5} rows={8} />}>
      <Leads params={params} />
    </Suspense>
  );
}

async function Leads({ params }) {
  const { projectId } = await params;
  const { project, leads, summary, filters, teamMembers } =
    await getProjectLeads(projectId);

  return (
    <LeadsBoard
      project={project}
      leads={leads}
      summary={summary}
      filters={filters}
      teamMembers={teamMembers}
      onCreateLead={createLead}
      onDeleteLead={deleteLead.bind(null, projectId)}
      onStatusChange={updateLeadStatus.bind(null, projectId)}
      onNote={addLeadNote.bind(null, projectId)}
    />
  );
}
