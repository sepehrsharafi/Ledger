import {
  BoardSkeleton,
  CardGridSkeleton,
  ModuleSkeleton,
  PanelsSkeleton,
  StripSkeleton,
  TableSkeleton,
} from "@/components/Skeleton";
import { resolveRouteMeta } from "@/lib/pageMeta";

/**
 * The static shape a route paints before its data (or even its code) arrives.
 * Shared by the `loading.js` boundaries and the optimistic pending state, so a
 * route always shows the same placeholder however it was reached.
 */
export const MODULE_SKELETONS = {
  overview: () => (
    <div className="space-y-8">
      <StripSkeleton cells={4} />
      <PanelsSkeleton panels={1} rows={3} />
      <CardGridSkeleton count={3} />
    </div>
  ),
  leads: () => <ModuleSkeleton cards={5} rows={8} />,
  campaigns: () => <ModuleSkeleton cards={4} rows={5} />,
  calendar: () => <PanelsSkeleton panels={1} rows={6} />,
  tasks: () => <BoardSkeleton />,
  team: () => <ModuleSkeleton cards={3} rows={5} />,
  approvals: () => <CardGridSkeleton count={2} columns="md:grid-cols-2" />,
  reports: () => <PanelsSkeleton panels={2} rows={4} />,
  "client-view": () => <ModuleSkeleton cards={4} rows={3} />,
  "project-settings": () => <PanelsSkeleton panels={2} rows={4} />,
};

const WORKSPACE_SKELETONS = {
  "/projects": () => <CardGridSkeleton count={3} />,
  "/team": () => <ModuleSkeleton cards={3} rows={6} />,
  "/settings": () => <PanelsSkeleton panels={2} rows={4} />,
};

/** The same placeholder a module route paints, addressable by module name. */
export function ModuleSkeletonFor({ module }) {
  return (MODULE_SKELETONS[module] || MODULE_SKELETONS.leads)();
}

export default function RouteSkeleton({ pathname }) {
  const { module } = resolveRouteMeta(pathname);

  if (module) {
    return (MODULE_SKELETONS[module] || MODULE_SKELETONS.leads)();
  }

  const segment = `/${(pathname || "").split("/").filter(Boolean)[0] || "projects"}`;
  return (WORKSPACE_SKELETONS[segment] || WORKSPACE_SKELETONS["/projects"])();
}
