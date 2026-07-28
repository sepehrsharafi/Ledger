import { Suspense } from "react";
import { CardGridSkeleton } from "@/components/Skeleton";
import ApprovalWorkbench from "@/components/project-modules/ApprovalWorkbench";
import {
  addApprovalComment,
  createApproval,
  deleteApproval,
  updateApprovalStatus,
} from "@/lib/actions/approvals";
import { getProjectApprovals } from "@/lib/data";

export default function ProjectApprovalsRoute({ params }) {
  return (
    <Suspense fallback={<CardGridSkeleton count={2} columns="md:grid-cols-2" />}>
      <Approvals params={params} />
    </Suspense>
  );
}

async function Approvals({ params }) {
  const { projectId } = await params;
  const { project, approvals, teamMembers } = await getProjectApprovals(projectId);

  return (
    <ApprovalWorkbench
      bundle={{ project, approvals }}
      store={{ teamMembers }}
      onStatusChange={updateApprovalStatus.bind(null, projectId)}
      onComment={addApprovalComment.bind(null, projectId)}
      onCreateApproval={createApproval}
      onDeleteApproval={deleteApproval.bind(null, projectId)}
    />
  );
}
