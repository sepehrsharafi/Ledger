"use client";

import { useState } from "react";
import EmptyState from "@/components/EmptyState";
import { Checkbox, Section, Segmented, StatStrip, Toggle } from "@/components/ui";
import { reportTabs } from "@/components/project-modules/shared";
import { formatDate, formatNumber } from "@/lib/utils";
import { SERIES } from "@/lib/palette";

const FREQUENCIES = ["Daily", "Weekly", "Monthly"];

const ordinal = (index) => String(index + 1).padStart(2, "0");

function DesignTab({ sections }) {
  return (
    <div className="grid gap-9 xl:grid-cols-2">
      <Section title="Included sections">
        {sections.map((section, index) => (
          <div
            key={section}
            className="flex items-center gap-3 border-b border-line-soft py-3"
          >
            <Checkbox checked onChange={() => {}} label={section} />
            <span className="num text-[11px] text-faint">{ordinal(index)}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{section}</span>
          </div>
        ))}
      </Section>

      <Section title="Order">
        {sections.map((section, index) => (
          <div
            key={section}
            className="flex items-center gap-3 border-b border-line-soft py-3"
          >
            <span aria-hidden className="text-faint">
              <svg viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-current stroke-[1.4]">
                <path d="M2 6h12M2 10h12" />
              </svg>
            </span>
            <span className="num text-[11px] text-faint">{ordinal(index)}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{section}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function ScheduleTab({ report, onUpdate }) {
  const [recipient, setRecipient] = useState("");

  function addRecipient() {
    if (!recipient.trim()) {
      return;
    }

    onUpdate((config) => ({
      ...config,
      recipients: [...config.recipients, recipient.trim()],
    }));
    setRecipient("");
  }

  return (
    <div className="grid gap-9 xl:grid-cols-2">
      <Section title="Cadence">
        <div className="flex items-center justify-between gap-4 border-b border-line-soft py-3">
          <span className="text-[13px] text-ink">Frequency</span>
          <select
            value={report.frequency}
            onChange={(event) =>
              onUpdate((config) => ({ ...config, frequency: event.target.value }))
            }
            aria-label="Report frequency"
            className="field w-[150px]"
          >
            {FREQUENCIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-line-soft py-3.5">
          <span className="min-w-0">
            <span className="block text-[13px] text-ink">Internal review first</span>
            <span className="mt-0.5 block text-[11.5px] text-muted">
              Hold the send until someone signs off.
            </span>
          </span>
          <Toggle
            checked={report.internalReviewFirst}
            label="Internal review first"
            onChange={() =>
              onUpdate((config) => ({
                ...config,
                internalReviewFirst: !config.internalReviewFirst,
              }))
            }
          />
        </div>
      </Section>

      <Section title="Recipients">
        {report.recipients.map((item) => (
          <div key={item} className="border-b border-line-soft py-3 text-[13px] text-ink">
            {item}
          </div>
        ))}
        <div className="flex gap-2 pt-4">
          <input
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="new@client.com"
            aria-label="New recipient"
            className="field flex-1"
          />
          <button type="button" onClick={addRecipient} className="btn btn-ghost">
            Add
          </button>
        </div>
      </Section>
    </div>
  );
}

function ActivityTab({ report }) {
  const { opens, downloads, lastOpenedDate } = report.engagementStats;
  const weeks = [1, 2, 3, 4, 5, 6].map((week) => ({
    week,
    opens: Math.max(2, opens - 18 + week * 4),
    downloads: Math.max(1, downloads - 6 + week),
  }));
  const peak = Math.max(1, ...weeks.map((item) => item.opens));

  return (
    <div className="space-y-9">
      <StatStrip
        items={[
          { label: "Opens", value: formatNumber(opens) },
          { label: "Downloads", value: formatNumber(downloads) },
          {
            label: "Last opened",
            value: lastOpenedDate ? formatDate(lastOpenedDate) : "Never",
          },
          {
            label: "Last sent",
            value: report.lastSentDate ? formatDate(report.lastSentDate) : "Never",
          },
        ]}
      />

      <Section title="Opens vs downloads" bodyClassName="pt-4">
        <div className="flex h-[200px] items-end gap-4 border-b border-line">
          {weeks.map((item) => (
            <div key={item.week} className="flex h-full flex-1 flex-col justify-end">
              <div className="flex h-full items-end gap-[3px]">
                <span
                  className="flex-1 bg-ink"
                  style={{ height: `${(item.opens / peak) * 100}%` }}
                />
                <span
                  className="flex-1"
                  style={{
                    height: `${(item.downloads / peak) * 100}%`,
                    backgroundColor: SERIES.light,
                  }}
                />
              </div>
              <span className="label pt-1.5 text-center">W{item.week}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export default function ReportsScreen({ bundle, onUpdateReport }) {
  const [tab, setTab] = useState("Design");
  const report = bundle.reportConfig;

  if (!report) {
    return (
      <EmptyState
        title="No report activity yet."
        description="This project has no report configuration yet."
      />
    );
  }

  // The updater is resolved here: a function cannot be handed to a Server Action,
  // so the tabs keep their `onUpdate(config => next)` shape and the plain result
  // is what travels.
  const update = (updater) => onUpdateReport(updater(report));

  return (
    <div className="space-y-7">
      <Segmented options={reportTabs} value={tab} onChange={setTab} />

      {tab === "Design" ? <DesignTab sections={report.includedSections} /> : null}
      {tab === "Schedule" ? <ScheduleTab report={report} onUpdate={update} /> : null}
      {tab === "Activity" ? <ActivityTab report={report} /> : null}
    </div>
  );
}
