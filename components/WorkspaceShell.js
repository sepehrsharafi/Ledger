"use client";

import { usePathname } from "next/navigation";
import AppShell from "@/components/AppShell";
import RouteSkeleton from "@/components/RouteSkeleton";
import { useRouteTransition } from "@/context/RouteTransition";
import { resolveRouteMeta } from "@/lib/pageMeta";

/**
 * Renders the agency chrome once for the whole workspace segment. Because it
 * lives in a layout it stays mounted across navigation, so a route change only
 * swaps the content area — and while the next route is still in flight that
 * area shows its skeleton instead of the page the user just left.
 */
export default function WorkspaceShell({ children }) {
  const pathname = usePathname();
  const { pendingPath } = useRouteTransition();

  // While a navigation is pending the chrome and content already describe the
  // destination, so the click feels like it landed immediately.
  const activePath = pendingPath || pathname;
  const meta = resolveRouteMeta(activePath);
  const content = pendingPath ? <RouteSkeleton pathname={pendingPath} /> : children;

  if (meta.bare) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-[1180px]">{content}</div>
      </div>
    );
  }

  return (
    <AppShell
      title={meta.title}
      subtitle={meta.description}
      projectId={meta.projectId}
      module={meta.module}
      action={meta.action}
      hidePageHeading={meta.hidePageHeading}
    >
      {content}
    </AppShell>
  );
}
