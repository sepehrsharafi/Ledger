"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/Badge";
import Drawer from "@/components/Drawer";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { cn, formatDate, toLocalDateKey } from "@/lib/utils";
import {
  calendarStatuses,
  channelColors,
  inputDateValue,
  isOverdueDate,
  marketingChannels,
  panelClassName,
} from "@/components/project-modules/shared";

function groupEventsByDate(events) {
  return events.reduce((acc, event) => {
    acc[event.date] = acc[event.date] || [];
    acc[event.date].push(event);
    return acc;
  }, {});
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
  const [eventComposerOpen, setEventComposerOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState({
    title: "",
    channel: "Social",
    date: inputDateValue(),
    status: "Draft",
    assignee: store.teamMembers[0]?.name || "Alex Morgan",
  });
  const eventDraftIsValid = eventDraft.title.trim() && eventDraft.date;
  const dayPreviewLimit = 2;

  if (!bundle.events.length) {
    return (
      <EmptyState
        title="No scheduled content yet."
        description="This project does not have upcoming local content events yet."
      />
    );
  }

  const baseDate = new Date("2026-06-01T00:00:00");
  const currentMonth = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + monthOffset,
    1,
  );
  const lastDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  );
  const startOffset = currentMonth.getDay();
  const days = Array.from({ length: startOffset + lastDay.getDate() }, (_, index) => {
    if (index < startOffset) {
      return null;
    }
    return new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      index - startOffset + 1,
    );
  });

  const visibleMonthPrefix = toLocalDateKey(currentMonth).slice(0, 7);
  const groupedEvents = useMemo(
    () =>
      Object.entries(groupEventsByDate(bundle.events))
        .filter(([date]) => date.startsWith(visibleMonthPrefix))
        .sort(([a], [b]) => a.localeCompare(b)),
    [bundle.events, visibleMonthPrefix],
  );

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setEventComposerOpen(true)}
          className="ledger-button ledger-button-primary w-full sm:w-auto"
        >
          + Add Calendar Item
        </button>
      </div>

      <div className={cn(panelClassName, "p-4 sm:p-6")}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setMonthOffset((current) => current - 1)}
            className="ledger-button-secondary rounded-[14px] px-4 py-2 text-sm text-slate-600"
          >
            Previous
          </button>
          <div className="text-center text-lg font-semibold tracking-[-0.02em] text-ledger-ink">
            {formatDate(currentMonth, { month: "long", year: "numeric" })}
          </div>
          <button
            onClick={() => setMonthOffset((current) => current + 1)}
            className="ledger-button-secondary rounded-[14px] px-4 py-2 text-sm text-slate-600"
          >
            Next
          </button>
        </div>

        <div className="space-y-4 md:hidden">
          {groupedEvents.map(([date, events]) => (
            <div key={date} className="rounded-[18px] border border-ledger-border bg-slate-50 p-4">
              <div className="text-sm font-semibold text-ledger-ink">
                {formatDate(date, { month: "long", day: "numeric", weekday: "short" })}
              </div>
              <div className="mt-3 space-y-3">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent({ ...event })}
                    className="w-full rounded-[14px] border border-white/80 bg-white p-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-ledger-ink">{event.title}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {event.channel} · {event.assignee}
                        </div>
                      </div>
                      <Badge tone={event.status}>{event.status}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-7 gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="px-2">
                {day}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-7 gap-3">
            {days.map((day, index) => {
              const dateKey = day ? toLocalDateKey(day) : null;
              const dayEvents = bundle.events.filter((event) => event.date === dateKey);
              const hasMultiple = dayEvents.length > 1;
              return (
                <div
                  key={index}
                  className="flex min-h-[140px] flex-col rounded-[18px] border border-ledger-border bg-slate-50 p-3"
                >
                  {day ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-ledger-ink">{day.getDate()}</div>
                      </div>
                      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
                        {!hasMultiple
                          ? dayEvents.slice(0, dayPreviewLimit).map((event) => (
                              <button
                                key={event.id}
                                onClick={() => setSelectedEvent({ ...event })}
                                className="w-full rounded-[14px] px-3 py-2 text-left text-xs font-semibold text-white"
                                style={{
                                  backgroundColor:
                                    channelColors[event.channel] || "#2B58E8",
                                }}
                              >
                                <div>{event.title}</div>
                                <div className="mt-1 text-[11px] font-medium text-white/80">
                                  {event.channel}
                                </div>
                              </button>
                            ))
                          : null}
                        {hasMultiple ? (
                          <button
                            onClick={() =>
                              setSelectedDay({
                                dateLabel: formatDate(day, {
                                  month: "long",
                                  day: "numeric",
                                }),
                                events: dayEvents,
                              })
                            }
                            className="mt-auto w-full rounded-[14px] border border-dashed border-[#BFD2FA] bg-white px-3 py-3 text-left text-sm font-semibold text-ledger-blue"
                          >
                            {dayEvents.length} items · View
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        title={selectedDay?.dateLabel || "Day items"}
      >
        {selectedDay ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Select an item below to open the event editor.
            </p>
            <div className="space-y-3">
              {selectedDay.events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent({ ...event });
                    setSelectedDay(null);
                  }}
                  className="w-full rounded-[16px] border border-[#E4EBF7] bg-[#FBFDFF] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-semibold text-ledger-ink">
                        {event.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {event.channel} · {event.assignee}
                      </div>
                    </div>
                    <Badge tone={event.status}>{event.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

      <Drawer
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Event"}
      >
        {selectedEvent ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
                <span className="mb-2 block">Title</span>
                <input
                  value={selectedEvent.title}
                  onChange={(event) =>
                    setSelectedEvent((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="ledger-input"
                />
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Channel</span>
                <select
                  value={selectedEvent.channel}
                  onChange={(event) =>
                    setSelectedEvent((current) => ({
                      ...current,
                      channel: event.target.value,
                    }))
                  }
                  className="ledger-select"
                >
                  {marketingChannels.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Status</span>
                <select
                  value={selectedEvent.status}
                  onChange={(event) =>
                    setSelectedEvent((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  className="ledger-select"
                >
                  {calendarStatuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Date</span>
                <input
                  type="date"
                  value={inputDateValue(selectedEvent.date)}
                  onChange={(event) =>
                    setSelectedEvent((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  className="ledger-input"
                />
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Assignee</span>
                <select
                  value={selectedEvent.assignee}
                  onChange={(event) =>
                    setSelectedEvent((current) => ({
                      ...current,
                      assignee: event.target.value,
                    }))
                  }
                  className="ledger-select"
                >
                  {store.teamMembers.map((member) => (
                    <option key={member.id}>{member.name}</option>
                  ))}
                </select>
              </label>
            </div>
            {isOverdueDate(selectedEvent.date, selectedEvent.status === "Published") ? (
              <div className="rounded-[14px] bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                This calendar item is overdue.
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={async () => {
                  await onDeleteEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete Item
              </button>
              <button
                disabled={!String(selectedEvent.title).trim()}
                onClick={() => {
                  if (!String(selectedEvent.title).trim()) {
                    return;
                  }
                  onUpdateEvent(selectedEvent.id, selectedEvent);
                  setSelectedEvent(null);
                }}
                className="ledger-button ledger-button-primary min-w-[150px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Item
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={eventComposerOpen}
        onClose={() => setEventComposerOpen(false)}
        title="New Calendar Item"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Title</span>
            <input
              value={eventDraft.title}
              onChange={(event) =>
                setEventDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Channel</span>
            <select
              value={eventDraft.channel}
              onChange={(event) =>
                setEventDraft((current) => ({
                  ...current,
                  channel: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {marketingChannels.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Status</span>
            <select
              value={eventDraft.status}
              onChange={(event) =>
                setEventDraft((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {calendarStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Date</span>
            <input
              type="date"
              value={eventDraft.date}
              onChange={(event) =>
                setEventDraft((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Assignee</span>
            <select
              value={eventDraft.assignee}
              onChange={(event) =>
                setEventDraft((current) => ({
                  ...current,
                  assignee: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {store.teamMembers.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            disabled={!eventDraftIsValid}
            onClick={() => {
              if (!eventDraftIsValid) {
                return;
              }
              onCreateEvent(bundle.project.id, eventDraft);
              setEventComposerOpen(false);
            }}
            className="ledger-button ledger-button-primary min-w-[150px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Item
          </button>
        </div>
      </Drawer>
    </>
  );
}
