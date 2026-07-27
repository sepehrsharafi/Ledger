import {
  CardGridSkeleton,
  ModuleSkeleton,
  PanelsSkeleton,
  SkeletonBlock,
} from "@/components/Skeleton";
import { resolveRouteMeta } from "@/lib/pageMeta";

function ProjectsHubSkeleton() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <SkeletonBlock className="h-4 w-80 max-w-[60%]" />
        <SkeletonBlock className="h-11 w-[150px] rounded-[14px]" />
      </div>
      <CardGridSkeleton count={6} />
    </>
  );
}

function TeamSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#E4EBF7] bg-white p-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-5 w-52" />
        </div>
        <SkeletonBlock className="h-11 w-[220px] rounded-[14px]" />
      </div>
      <CardGridSkeleton count={4} columns="lg:grid-cols-2" />
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.85fr]">
      <PanelsSkeleton panels={2} rows={4} />
      <PanelsSkeleton panels={2} rows={3} />
    </div>
  );
}

/**
 * The static shape a route paints before its data (or even its code) arrives.
 * Shared by the `loading.js` boundaries and the optimistic pending state so a
 * route always shows the same placeholder.
 */
export default function RouteSkeleton({ pathname }) {
  const { projectId, module } = resolveRouteMeta(pathname);

  if (!projectId) {
    if (pathname?.startsWith("/team")) {
      return <TeamSkeleton />;
    }
    if (pathname?.startsWith("/settings")) {
      return <SettingsSkeleton />;
    }
    return <ProjectsHubSkeleton />;
  }

  switch (module) {
    case "tasks":
      return <ModuleSkeleton cards={0} board />;
    case "client-view":
      return <ModuleSkeleton cards={4} rows={3} />;
    case "project-settings":
      return <PanelsSkeleton panels={2} rows={4} />;
    default:
      return <ModuleSkeleton cards={4} rows={5} />;
  }
}
