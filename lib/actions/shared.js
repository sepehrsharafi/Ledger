import { revalidatePath } from "next/cache";
import { getCollectionRecords } from "@/backend/postgres-store";

/**
 * The sidebar's tallies and the unread badge are rendered by the workspace
 * layout, not by any page. Revalidating only the page a mutation happened on
 * leaves those numbers stale until a reload, so anything that changes a count
 * has to revalidate the layout too.
 */
export function revalidateProjectChrome(projectId) {
  revalidatePath(`/projects/${projectId}`, "layout");
}

/**
 * Helpers shared by the action modules. Kept out of them because a `"use server"`
 * file may only export async functions.
 */
export function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Stands in for a session. This build has no real auth, so authored records fall
 * back to the store's canonical user exactly as the client hook used to.
 */
export async function getAuthorName() {
  const members = await getCollectionRecords("teamMembers");
  return (
    members.find((member) => member.name === "Alex Morgan")?.name ||
    members[0]?.name ||
    "Alex Morgan"
  );
}
