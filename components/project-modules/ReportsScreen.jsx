"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";
import { reportTabs, SectionCard } from "@/components/project-modules/shared";

export default function ReportsScreen({ bundle, onUpdateReport }) {
  const [tab, setTab] = useState("Design");
  const [recipient, setRecipient] = useState("");

  if (!bundle.reportConfig) {
    return (
      <EmptyState
        title="No report activity yet."
        description="This project has no report configuration yet."
      />
    );
  }

  const report = bundle.reportConfig;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {reportTabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item
                ? "bg-ledger-blue text-white"
                : "border border-[#E4EBF7] bg-white text-slate-500"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Design" ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard title="Included Sections">
            <div className="space-y-3">
              {report.includedSections.map((section) => (
                <label
                  key={section}
                  className="flex items-center justify-between rounded-[16px] border border-ledger-border px-4 py-3"
                >
                  <span className="text-sm font-medium text-ledger-ink">{section}</span>
                  <input
                    type="checkbox"
                    checked={report.includedSections.includes(section)}
                    onChange={() => {}}
                    readOnly
                  />
                </label>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Ordering">
            <div className="space-y-3">
              {report.includedSections.map((section, index) => (
                <div key={section} className="rounded-[16px] bg-slate-50 px-4 py-3 text-sm text-ledger-ink">
                  {index + 1}. {section}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : null}

      {tab === "Schedule" ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <SectionCard title="Schedule">
            <div className="space-y-4">
              <select
                value={report.frequency}
                onChange={(event) =>
                  onUpdateReport(bundle.project.id, (config) => ({
                    ...config,
                    frequency: event.target.value,
                  }))
                }
                className="ledger-select"
              >
                {["Daily", "Weekly", "Monthly"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <label className="flex items-center justify-between rounded-[16px] border border-ledger-border px-4 py-3">
                <span className="text-sm font-medium text-ledger-ink">Internal review first</span>
                <input
                  type="checkbox"
                  checked={report.internalReviewFirst}
                  onChange={() =>
                    onUpdateReport(bundle.project.id, (config) => ({
                      ...config,
                      internalReviewFirst: !config.internalReviewFirst,
                    }))
                  }
                />
              </label>
            </div>
          </SectionCard>
          <SectionCard title="Recipients">
            <div className="space-y-3">
              {report.recipients.map((item) => (
                <div
                  key={item}
                  className="rounded-[16px] bg-slate-50 px-4 py-3 text-sm text-ledger-ink"
                >
                  {item}
                </div>
              ))}
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder="new@client.com"
                  className="ledger-input flex-1"
                />
                <button
                  onClick={() => {
                    if (!recipient.trim()) {
                      return;
                    }
                    onUpdateReport(bundle.project.id, (config) => ({
                      ...config,
                      recipients: [...config.recipients, recipient.trim()],
                    }));
                    setRecipient("");
                  }}
                  className="ledger-button ledger-button-primary px-4 text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : null}

      {tab === "Activity" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard title="Engagement">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Opens", report.engagementStats.opens],
                ["Downloads", report.engagementStats.downloads],
                [
                  "Last Opened",
                  report.engagementStats.lastOpenedDate
                    ? formatDate(report.engagementStats.lastOpenedDate)
                    : "Never",
                ],
                ["Last Sent", report.lastSentDate ? formatDate(report.lastSentDate) : "Never"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[16px] bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Engagement Chart">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[1, 2, 3, 4, 5, 6].map((week) => ({
                    week: `W${week}`,
                    opens: Math.max(2, report.engagementStats.opens - 18 + week * 4),
                    downloads: Math.max(1, report.engagementStats.downloads - 6 + week),
                  }))}
                >
                  <CartesianGrid stroke="#e5edf9" vertical={false} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} stroke="#8b9bb8" />
                  <YAxis axisLine={false} tickLine={false} stroke="#8b9bb8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="opens" stroke="#2B58E8" strokeWidth={3} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="downloads"
                    stroke="#14B8A6"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
