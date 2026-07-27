"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { Avatar } from "@/components/ui";
import { ChevronDownIcon, NavIcon } from "@/components/dashboard/DashboardIcons";
import { useRouteTransition } from "@/context/RouteTransition";
import { cn } from "@/lib/utils";
import { AVATAR_FILL, SERIES } from "@/lib/palette";

function NavRow({ item, onNavigate }) {
  const { startNavigation } = useRouteTransition();

  return (
    <Link
      href={item.href}
      onClick={() => {
        startNavigation(item.href);
        onNavigate?.();
      }}
      className={cn(
        "relative flex h-[38px] items-center gap-3 px-5 transition-colors",
        item.active
          ? "bg-shade before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-accent"
          : "hover:bg-shade",
      )}
    >
      <NavIcon
        name={item.icon}
        className={cn("h-[15px] w-[15px] shrink-0", item.active ? "text-accent" : "text-faint")}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[13px]",
          item.active ? "font-semibold text-ink" : "text-ink-soft",
        )}
      >
        {item.label}
      </span>
      {item.count ? (
        <span className={cn("num text-[10px]", item.countTone || "text-faint")}>
          {item.count}
        </span>
      ) : null}
    </Link>
  );
}

function NavGroup({ title, items, onNavigate }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="pt-5">
      <div className="label px-5 pb-2">{title}</div>
      {items.map((item) => (
        <NavRow key={item.key} item={item} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

/** The project switcher: a colour-barred plate that opens the project list. */
function ProjectSwitcher({
  project,
  otherProjects,
  open,
  onToggle,
  onSelect,
  containerRef,
}) {
  return (
    <div ref={containerRef} className="relative px-5 pt-5">
      <div className="label pb-2">Project</div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 border border-line bg-white px-2.5 py-2 text-left transition-colors hover:border-ink"
      >
        <span
          className="h-7 w-[3px] shrink-0"
          style={{ backgroundColor: project?.brandPrimary || SERIES.pale }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-ink">
            {project?.name || "All projects"}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-muted">
            {project?.clientName || "Choose a workspace"}
          </span>
        </span>
        <ChevronDownIcon
          className={cn("h-3.5 w-3.5 shrink-0 text-faint transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="absolute inset-x-5 top-[calc(100%-2px)] z-30 border border-line bg-white">
          <button
            type="button"
            onClick={() => onSelect("/projects")}
            className="flex w-full items-center px-2.5 py-2 text-left text-[13px] text-ink-soft transition-colors hover:bg-shade"
          >
            All projects
          </button>
          {otherProjects.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(`/projects/${item.id}`)}
              className="flex w-full items-center gap-2.5 border-t border-line-soft px-2.5 py-2 text-left transition-colors hover:bg-shade"
            >
              <span
                className="h-4 w-[3px] shrink-0"
                style={{ backgroundColor: item.brandPrimary || SERIES.pale }}
              />
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar({
  nav,
  project,
  showSwitcher,
  otherProjects,
  switcherOpen,
  onToggleSwitcher,
  onSelectProject,
  switcherRef,
  user,
  viewerRole,
  menuOpen,
  onToggleMenu,
  onLogout,
  userMenuRef,
  open,
  onClose,
}) {
  return (
    <aside
      className={cn(
        // Below xl the sidebar is a drawer; from xl up it is a permanent column,
        // so the offset is scoped to the narrow breakpoints only.
        "fixed inset-y-0 left-0 z-40 flex w-[236px] flex-col border-r border-line bg-white transition-transform duration-200",
        open ? "" : "max-xl:-translate-x-full",
      )}
    >
      <div className="flex h-[57px] shrink-0 items-center justify-between border-b border-line px-5">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="text-faint transition-colors hover:text-ink xl:hidden"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.6]">
            <path d="M5 5l10 10M15 5 5 15" />
          </svg>
        </button>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto pb-5">
        {showSwitcher ? (
          <ProjectSwitcher
            project={project}
            otherProjects={otherProjects}
            open={switcherOpen}
            onToggle={onToggleSwitcher}
            onSelect={onSelectProject}
            containerRef={switcherRef}
          />
        ) : null}
        <NavGroup title="Main" items={nav.main} onNavigate={onClose} />
        <NavGroup title="Manage" items={nav.manage} onNavigate={onClose} />
      </div>

      <div ref={userMenuRef} className="relative shrink-0 border-t border-line">
        {menuOpen ? (
          <div className="absolute inset-x-0 bottom-full border-t border-line bg-white">
            <button
              type="button"
              onClick={onLogout}
              className="w-full px-5 py-2.5 text-left text-[13px] text-ink-soft transition-colors hover:bg-shade"
            >
              Log out
            </button>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onToggleMenu}
          className="flex w-full items-center gap-2.5 px-5 py-3 text-left transition-colors hover:bg-shade"
        >
          <Avatar name={user?.name || "Alex Morgan"} color={AVATAR_FILL} className="h-7 w-7" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-ink">
              {user?.name || "Alex Morgan"}
            </span>
            <span className="label mt-0.5 block">{viewerRole}</span>
          </span>
          <ChevronDownIcon
            className={cn("h-3.5 w-3.5 shrink-0 text-faint transition-transform", menuOpen && "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
}
