import { ModuleSkeleton } from "@/components/Skeleton";

// Instant fallback for workspace routes without a more specific one. Server
// rendered with zero client JS, so it paints while the route's code and data
// are still on the way.
export default function WorkspaceLoading() {
  return <ModuleSkeleton cards={4} rows={5} />;
}
