import { BoardSkeleton } from "@/components/Skeleton";

// The route owns its own placeholder now — no pathname registry to look it up in.
export default function TasksLoading() {
  return <BoardSkeleton />;
}
