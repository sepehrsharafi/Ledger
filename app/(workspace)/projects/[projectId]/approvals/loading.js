import { CardGridSkeleton } from "@/components/Skeleton";

export default function ApprovalsLoading() {
  return <CardGridSkeleton count={2} columns="md:grid-cols-2" />;
}
