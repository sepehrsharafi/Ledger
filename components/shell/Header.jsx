"use client";

import { BellIcon, SearchIcon } from "@/components/dashboard/DashboardIcons";
import { cn } from "@/lib/utils";

/**
 * Breadcrumb on the left, then search, notifications and the route's primary
 * action. Everything here is derived from the pathname, so the header is fully
 * painted before the screen underneath it has any data.
 */
export default function Header({
  crumbs = [],
  unreadCount = 0,
  action,
  onAction,
  onOpenNav,
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[57px] items-center gap-4 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="flex h-[30px] w-[30px] shrink-0 items-center justify-center border border-line text-ink-soft xl:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.6]">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <nav className="label flex min-w-0 items-center gap-1.5 truncate" aria-label="Breadcrumb">
        {crumbs.map((crumb, index) => (
          <span key={crumb} className="flex min-w-0 items-center gap-1.5">
            {index ? <span className="text-faint">/</span> : null}
            <span
              className={cn(
                "truncate",
                index === crumbs.length - 1 ? "label-ink font-semibold" : "",
              )}
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        <label className="relative hidden lg:block">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
          <input
            type="search"
            placeholder="Search"
            aria-label="Search"
            className="field w-[220px] pl-8"
          />
        </label>

        <button
          type="button"
          aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
          className="relative flex h-[34px] w-[34px] items-center justify-center border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          <BellIcon className="h-4 w-4" />
          {unreadCount ? (
            <span className="num absolute -right-[5px] -top-[5px] flex h-[15px] min-w-[15px] items-center justify-center bg-accent px-[3px] text-[9px] font-semibold leading-none text-white">
              {unreadCount}
            </span>
          ) : null}
        </button>

        {action ? (
          <button type="button" onClick={onAction} className="btn btn-primary">
            {action}
          </button>
        ) : null}
      </div>
    </header>
  );
}
