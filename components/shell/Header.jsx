"use client";

import { useEffect, useRef, useState } from "react";
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
  notifications = [],
  onOpenNotification,
  action,
  onAction,
  onOpenNav,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // The panel is not nested inside the bell any more (see below), so dismissing
  // has to spare both elements rather than one subtree.
  const bellRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!notificationsOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        bellRef.current?.contains(event.target) ||
        panelRef.current?.contains(event.target)
      ) {
        return;
      }
      setNotificationsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [notificationsOpen]);

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
          ref={bellRef}
          type="button"
          onClick={() => setNotificationsOpen((current) => !current)}
          aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
          aria-expanded={notificationsOpen}
          className={cn(
            "relative flex h-[34px] w-[34px] items-center justify-center border text-ink-soft transition-colors hover:border-ink hover:text-ink",
            notificationsOpen ? "border-ink text-ink" : "border-line",
          )}
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

      {/*
        The panel is a sibling of the bell, not a child of it. Anchoring to the
        bell meant a fixed-width dropdown opening leftwards from wherever the bell
        happened to sit — and on a narrow screen the bell is pushed inboard by the
        primary action, so the panel ran off the left edge of the viewport.

        Anchoring to `<header>` instead, `inset-x-0` gives a full-bleed sheet
        under the bar on mobile, which cannot overflow whatever the width. From
        `sm` up `left-auto` releases the left edge so it becomes a 320px dropdown
        aligned to the bar's right gutter.

        It stays mounted and is hidden with classes — the same approach `Modal`
        takes — because an element that unmounts on close has nothing left to
        animate out.

        Two things about the transition list. `translate`, not `transform`:
        Tailwind v4's `-translate-y-1` compiles to the `translate` property, so
        naming `transform` would animate the fade but let the slide jump. And
        `visibility` is listed deliberately — it is a discrete property, so it
        holds `visible` for the whole 150ms and only flips at the end, which is
        what lets the fade-out be seen at all while still keeping the closed panel
        out of the tab order. Neither is in Tailwind's default `transition` set.
      */}
      <div
        ref={panelRef}
        className={cn(
          "absolute inset-x-0 top-[calc(100%+7px)] z-40 border border-line bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-[opacity,translate,visibility] duration-150 ease-out motion-reduce:transition-none sm:left-auto sm:right-6 sm:w-[320px]",
          notificationsOpen
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="label flex items-center justify-between gap-3 border-b border-line px-3.5 py-2.5">
          Needs attention
          <span className="num text-[11px] text-ink">{notifications.length}</span>
        </div>

        {notifications.length ? (
          <div className="max-h-[340px] overflow-y-auto">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setNotificationsOpen(false);
                  onOpenNotification?.(item.href);
                }}
                className="flex w-full flex-col items-start gap-1 border-b border-line-soft px-3.5 py-2.5 text-left transition-colors last:border-b-0 hover:bg-shade"
              >
                <span className="flex w-full items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-[12.5px] font-semibold text-ink">
                    {item.title}
                  </span>
                  <span className="label shrink-0 text-[9px] text-accent">
                    {item.kind}
                  </span>
                </span>
                <span className="label truncate">{item.project}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="px-3.5 py-4 text-[12.5px] text-muted">
            Nothing waiting on you.
          </p>
        )}
      </div>
    </header>
  );
}
