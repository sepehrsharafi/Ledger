import { Suspense } from "react";
import { ModuleSkeleton } from "@/components/Skeleton";
import ClientViewScreen from "@/components/project-modules/ClientViewScreen";
import { getProjectClient } from "@/lib/data";

export default function ProjectClientViewRoute({ params }) {
  return (
    <Suspense fallback={<ModuleSkeleton cards={4} rows={3} />}>
      <ClientView params={params} />
    </Suspense>
  );
}

async function ClientView({ params }) {
  const { projectId } = await params;
  const bundle = await getProjectClient(projectId);

  return <ClientViewScreen bundle={bundle} />;
}
