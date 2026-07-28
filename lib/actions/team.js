"use server";

import { revalidatePath } from "next/cache";
import {
  createRecord,
  deleteRecord,
  getCollectionRecords,
} from "@/backend/postgres-store";

/**
 * Unassigning someone who still owns tasks on the project needs an explicit
 * confirmation, so this returns a status the screen can react to rather than
 * throwing. Returned values are plain objects — a Server Action's result is
 * serialized back to the client.
 */
export async function toggleTeamMemberAssignment(projectId, memberId, options = {}) {
  const [teamMembers, projectMembers] = await Promise.all([
    getCollectionRecords("teamMembers"),
    getCollectionRecords("projectMembers", { projectId }),
  ]);

  const member = teamMembers.find((item) => item.id === memberId);
  if (!member) {
    return { status: "missing-member" };
  }

  const isAssigned = projectMembers.some((link) => link.memberId === memberId);

  if (isAssigned) {
    const assignedTasks = (await getCollectionRecords("tasks", { projectId })).filter(
      (task) => task.assignee === member.name,
    );

    if (assignedTasks.length && !options.force) {
      return {
        status: "requires-confirmation",
        member,
        assignedTasks,
        taskCount: assignedTasks.length,
      };
    }

    await deleteRecord("projectMembers", `${projectId}__${memberId}`);
  } else {
    await createRecord("projectMembers", { projectId, memberId });
  }

  revalidatePath(`/projects/${projectId}/team`);
  revalidatePath(`/projects/${projectId}/settings`);
  revalidatePath("/team");

  return { status: "updated" };
}
