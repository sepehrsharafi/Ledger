"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Frame, IconButton, Pill } from "@/components/ui";
import {
  EventComposerDrawer,
  EventDetailDrawer,
} from "@/components/project-modules/CalendarDrawers";
import { marketingChannels } from "@/components/project-modules/shared";
import { CHANNEL_COLORS } from "@/lib/palette";
import { usePageAction } from "@/context/PageAction";
import { cn, formatDate, toLocalDateKey } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const INLINE_LIMIT = 3;

// The demo data is anchored to June 2026, so that is where the calendar opens.
const ANCHOR_MONTH = new Date("2026-06-01T00:00:00");

/** Leading blanks plus one entry per day, so the grid fills row by row. */
function buildMonthCells(month) {
  const lastDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = month.getDay();

  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from(
      { length: lastDate },
      (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1),
    ),
  ];
}

function EventChip({ event, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-2 border-l-2 bg-shade py-1 pl-2 pr-1 text-left transition-colors hover:bg-line-soft"
      style={{ borderColor: CHANNEL_COLORS[event.channel] || CHANNEL_COLORS.Social }}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11.5px] leading-4 text-ink">
          {event.title}
        </span>
        <span className="label mt-0.5 block truncate text-[9px]">{event.status}</span>
      </span>
    </button>
  );
}

export default function CalendarScreen({
  bundle,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  store,
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);

  usePageAction(() => setComposerOpen(true));

  const events = bundle.events || [];
  const month = new Date(
    ANCHOR_MONTH.getFullYear(),
    ANCHOR_MONTH.getMonth() + monthOffset,
    1,
  );

  const byDate = useMemo(
    () =>
      events.reduce((acc, event) => {
        acc[event.date] = [...(acc[event.date] || []), event];
        return acc;
      }, {}),
    [events],
  );

  if (!events.length) {
    return (
      <EmptyState
        title="No scheduled content yet."
        description="This project has no upcoming content events yet."
      />
    );
  }

  const cells = buildMonthCells(month);
  const monthPrefix = toLocalDateKey(month).slice(0, 7);
  const monthDays = Object.entries(byDate)
    .filter(([date]) => date.startsWith(monthPrefix))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="display text-[21px] text-ink">
              {formatDate(month, { month: "long", year: "numeric", day: undefined })}
            </h2>
            <div className="flex gap-px">
              <IconButton
                onClick={() => setMonthOffset((current) => current - 1)}
                aria-label="Previous month"
                className="h-[26px] w-[26px]"
              >
                <svg viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-current stroke-[1.6]">
                  <path d="M10 3 5 8l5 5" />
                </svg>
              </IconButton>
              <IconButton
                onClick={() => setMonthOffset((current) => current + 1)}
                aria-label="Next month"
                className="h-[26px] w-[26px]"
              >
                <svg viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-current stroke-[1.6]">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </IconButton>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {marketingChannels.map((channel) => (
              <span key={channel} className="label inline-flex items-center gap-1.5">
                <span
                  className="h-[7px] w-[7px]"
                  style={{ backgroundColor: CHANNEL_COLORS[channel] }}
                />
                {channel}
              </span>
            ))}
          </div>
        </div>

        {/* Day list below the grid's minimum comfortable width. */}
        <div className="md:hidden">
          {monthDays.map(([date, dayEvents]) => (
            <div key={date} className="border-b border-line-soft py-3.5">
              <div className="label pb-2">
                {formatDate(date, { weekday: "short", month: "short" })}
              </div>
              <div className="space-y-1.5">
                {dayEvents.map((event) => (
                  <EventChip
                    key={event.id}
                    event={event}
                    onClick={() => setSelectedEvent({ ...event })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Frame className="hidden md:block">
          <div className="grid-hairline grid grid-cols-7">
            {WEEKDAYS.map((day) => (
              <div key={day} className="label px-3 py-2.5">
                {day}
              </div>
            ))}
            {cells.map((day, index) => {
              const dateKey = day ? toLocalDateKey(day) : null;
              const dayEvents = dateKey ? byDate[dateKey] || [] : [];
              const overflow = dayEvents.length - INLINE_LIMIT;

              return (
                <div
                  key={dateKey || `blank-${index}`}
                  className={cn(
                    "min-h-[124px] p-2",
                    day ? "" : "bg-shade",
                  )}
                >
                  {day ? (
                    <>
                      <div className="num px-1 text-[11px] text-muted">{day.getDate()}</div>
                      <div className="mt-2 space-y-1.5">
                        {dayEvents.slice(0, INLINE_LIMIT).map((event) => (
                          <EventChip
                            key={event.id}
                            event={event}
                            onClick={() => setSelectedEvent({ ...event })}
                          />
                        ))}
                        {overflow > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedDay({
                                label: formatDate(day, { month: "long" }),
                                events: dayEvents,
                              })
                            }
                            className="label w-full px-1 py-0.5 text-left text-accent"
                          >
                            +{overflow} more
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Frame>
      </div>

      <Modal
        open={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        eyebrow="Day items"
        title={selectedDay?.label || "Day items"}
      >
        <div className="border-t border-line">
          {(selectedDay?.events || []).map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => {
                setSelectedEvent({ ...event });
                setSelectedDay(null);
              }}
              className="flex w-full items-center justify-between gap-4 border-b border-line-soft py-3 text-left transition-colors hover:bg-shade"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-ink">
                  {event.title}
                </span>
                <span className="label mt-1 block">
                  {event.channel} · {event.assignee}
                </span>
              </span>
              <Pill tone={event.status}>{event.status}</Pill>
            </button>
          ))}
        </div>
      </Modal>

      <EventDetailDrawer
        event={selectedEvent}
        teamMembers={store.teamMembers}
        onChange={(patch) => setSelectedEvent((current) => ({ ...current, ...patch }))}
        onClose={() => setSelectedEvent(null)}
        onSave={() => {
          onUpdateEvent(selectedEvent.id, selectedEvent);
          setSelectedEvent(null);
        }}
        onDelete={async () => {
          await onDeleteEvent(selectedEvent.id);
          setSelectedEvent(null);
        }}
      />

      <EventComposerDrawer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreate={onCreateEvent}
        projectId={bundle.project.id}
        teamMembers={store.teamMembers}
      />
    </>
  );
}
