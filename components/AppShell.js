"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/shell/Header";
import Sidebar from "@/components/shell/Sidebar";
import { useAppContext } from "@/context/AppContext";
import { usePageActionHandler } from "@/context/PageAction";
import { useRouteTransition } from "@/context/RouteTransition";
import { buildSidebarNav } from "@/lib/navigation";
import { useShellData } from "@/lib/useShellData";

/** Closes a popover when the pointer lands outside any of the given refs. */
function useDismissOnOutsideClick(refs, close) {
  useEffect(() => {
    function handlePointerDown(event) {
      refs.forEach(({ ref, onClose }) => {
        if (ref.current && !ref.current.contains(event.target)) {
          onClose();
        }
      });
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
    // Refs and setters are stable for the lifetime of the shell.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default function AppShell({
  title,
  subtitle,
  projectId,
  module,
  action,
  shellData,
  hidePageHeading = false,
  children,
}) {
  const committedPathname = usePathname();
  const router = useRouter();
  const { pendingPath, startNavigation } = useRouteTransition();
  // Treat the destination as current the moment it is clicked, not once it commits.
  const pathname = pendingPath || committedPathname;
  const { isAuthenticated, logout, viewerRole } = useAppContext();
  const { projects, teamMembers, unreadCount, navCounts, notifications } =
    useShellData(shellData);
  const onAction = usePageActionHandler();

  const [navOpen, setNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const userMenuRef = useRef(null);
  const switcherRef = useRef(null);

  useDismissOnOutsideClick([
    { ref: userMenuRef, onClose: () => setUserMenuOpen(false) },
    { ref: switcherRef, onClose: () => setSwitcherOpen(false) },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  // Workspace routes keep their project context in the query string.
  const queryProjectId =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("project");
  const activeProjectId = projectId || queryProjectId;
  const project = projects.find((item) => item.id === activeProjectId) || null;
  const isProjectsHub = pathname === "/projects";

  const nav = buildSidebarNav({
    projectId,
    module,
    pathname,
    viewerRole,
    counts: navCounts?.[activeProjectId] || {},
  });
  const user = teamMembers.find((member) => member.name === "Alex Morgan") || teamMembers[0];
  const crumbs = [project?.name, title].filter(Boolean);

  function goTo(href) {
    startNavigation(href);
    router.push(href);
    setSwitcherOpen(false);
    setNavOpen(false);
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      {navOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-ink/20 xl:hidden"
        />
      ) : null}

      <Sidebar
        nav={nav}
        project={project}
        showSwitcher={!isProjectsHub && Boolean(activeProjectId)}
        otherProjects={projects.filter((item) => item.id !== project?.id)}
        switcherOpen={switcherOpen}
        onToggleSwitcher={() => setSwitcherOpen((current) => !current)}
        onSelectProject={goTo}
        switcherRef={switcherRef}
        user={user}
        viewerRole={viewerRole}
        menuOpen={userMenuOpen}
        onToggleMenu={() => setUserMenuOpen((current) => !current)}
        onLogout={() => {
          logout();
          setUserMenuOpen(false);
          router.replace("/login");
        }}
        userMenuRef={userMenuRef}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <div className="flex min-h-screen flex-col xl:pl-[236px]">
        <Header
          crumbs={crumbs}
          unreadCount={unreadCount}
          notifications={notifications}
          onOpenNotification={goTo}
          action={action}
          onAction={onAction || undefined}
          onOpenNav={() => setNavOpen(true)}
        />

        <main className="min-w-0 flex-1 px-4 py-7 sm:px-6">
          {hidePageHeading ? null : (
            <div className="mb-7">
              <h1 className="display text-[32px] text-ink sm:text-[38px]">{title}</h1>
              {subtitle ? (
                <p className="mt-2 max-w-2xl text-[13.5px] text-muted">{subtitle}</p>
              ) : null}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
