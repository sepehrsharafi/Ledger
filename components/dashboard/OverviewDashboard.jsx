"use client";

import Link from "next/link";
import { useState } from "react";
import { LegendDot, MonthAxis, TrendArea, TrendLines } from "@/components/dashboard/Trend";
import {
  getCampaignRows,
  getChannelLegend,
  getKpiItems,
  getPerformanceMetrics,
  getPipelineStages,
  getReportingWindow,
  relativeTime,
} from "@/components/dashboard/overviewMetrics";
import {
  Avatar,
  Checkbox,
  Frame,
  Meter,
  MetaLink,
  Section,
  Segmented,
  StatStrip,
} from "@/components/ui";
import { CHANNEL_RAMP } from "@/lib/palette";
import { formatDate } from "@/lib/utils";

const VIEW_OPTIONS = [
  { value: "separate", label: "Separate" },
  { value: "indexed", label: "Indexed" },
];

function Performance({ months, metrics, view, onViewChange }) {
  return (
    <Section
      title="Performance · 12 months"
      action={<Segmented options={VIEW_OPTIONS} value={view} onChange={onViewChange} />}
    >
      {view === "separate" ? (
        <div>
          {metrics.map((metric) => (
            <div
              key={metric.key}
              className="grid items-center gap-4 border-b border-line-soft py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-6"
            >
              <div className="min-w-0">
                <LegendDot color={metric.color}>{metric.label}</LegendDot>
                <div className="display mt-2 text-[22px] text-ink">
                  {metric.format(metric.latest)}
                </div>
                <div className="mt-1.5 text-[11.5px] text-muted">
                  range {metric.rangeFormat(metric.min)}–{metric.rangeFormat(metric.max)}
                </div>
              </div>
              <TrendArea values={metric.values} color={metric.color} height={64} />
            </div>
          ))}
          <MonthAxis months={months} className="sm:pl-[214px]" />
        </div>
      ) : (
        <div className="pt-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {metrics.map((metric) => (
              <LegendDot key={metric.key} color={metric.color}>
                {metric.label}
              </LegendDot>
            ))}
          </div>
          <div className="mt-5">
            <TrendLines
              series={metrics.map((metric) => ({
                key: metric.key,
                color: metric.color,
                values: metric.indexed,
              }))}
              height={232}
            />
            <MonthAxis months={months} />
          </div>
          <p className="mt-3 text-[11.5px] text-muted">
            Indexed to {months[0]} = 100, so all three metrics share one scale.
          </p>
        </div>
      )}
    </Section>
  );
}

function ChannelBreakdown({ rows, leadTotal }) {
  return (
    <Section title="Leads by channel">
      <div className="flex h-[7px] w-full gap-px pt-3">
        {rows.map((row, index) => (
          <span
            key={row.name}
            style={{
              width: `${row.share}%`,
              backgroundColor: CHANNEL_RAMP[index] || CHANNEL_RAMP.at(-1),
            }}
          />
        ))}
      </div>
      <div className="mt-2">
        {rows.map((row, index) => (
          <div
            key={row.name}
            className="flex items-center gap-3 border-b border-line-soft py-2.5"
          >
            <span
              className="h-[7px] w-[7px] shrink-0"
              style={{ backgroundColor: CHANNEL_RAMP[index] || CHANNEL_RAMP.at(-1) }}
            />
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">
              {row.name}
            </span>
            <span className="num text-[13px] font-semibold text-ink">{row.share}%</span>
            <span className="num w-8 text-right text-[11px] text-muted">{row.count}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11.5px] text-muted">
        {leadTotal} leads across {rows.length} attributed channels.
      </p>
    </Section>
  );
}

function Pipeline({ stages }) {
  return (
    <Section title="Pipeline">
      {stages.map((stage) => (
        <div key={stage.label} className="border-b border-line-soft py-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold text-ink">{stage.label}</span>
            <span className="flex items-baseline gap-2">
              <span className="display text-[19px] text-ink">{stage.count}</span>
              <span className="num text-[11px] text-muted">{stage.share.toFixed(1)}%</span>
            </span>
          </div>
          <Meter value={stage.share} className="mt-2.5" />
          <div className="mt-2 text-[11.5px] text-muted">{stage.caption}</div>
        </div>
      ))}
    </Section>
  );
}

function TopCampaigns({ rows, href }) {
  return (
    <Section title="Top campaigns" action={<MetaLink href={href}>All</MetaLink>}>
      {rows.map((row) => (
        <div key={row.id} className="border-b border-line-soft py-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
              {row.name}
            </span>
            <span className="num shrink-0 text-[13px] text-ink">{row.spend}</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-3">
            <span className="label truncate">{row.channel}</span>
            <span className="num shrink-0 text-[11px] text-muted">{row.detail}</span>
          </div>
          <Meter value={row.share} className="mt-2.5" />
        </div>
      ))}
    </Section>
  );
}

function Activity({ items, members, href }) {
  return (
    <Section title="Activity" action={<MetaLink href={href}>All</MetaLink>}>
      {items.slice(0, 5).map((item, index) => (
        <div key={item.id} className="flex gap-3 border-b border-line-soft py-3.5">
          <Avatar
            name={item.author}
            color={members.find((member) => member.name === item.author)?.avatarColor}
            className="mt-px h-[22px] w-[22px]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[13px] font-semibold text-ink">
                {item.author}
              </span>
              <span className="num shrink-0 text-[11px] text-muted">
                {relativeTime(index)}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] leading-5 text-muted">{item.content}</p>
          </div>
        </div>
      ))}
    </Section>
  );
}

function DueThisWeek({ tasks, href }) {
  return (
    <Section title="Due this week" action={<MetaLink href={href}>Board</MetaLink>}>
      {tasks.map((task) => {
        const done = task.column === "Done";

        return (
          <div
            key={task.id}
            className="flex items-center gap-3 border-b border-line-soft py-3"
          >
            <Checkbox checked={done} onChange={() => {}} label={task.title} />
            <span
              className={
                done
                  ? "min-w-0 flex-1 truncate text-[13px] text-faint line-through"
                  : "min-w-0 flex-1 truncate text-[13px] text-ink"
              }
            >
              {task.title}
            </span>
            <span className="label hidden shrink-0 truncate sm:block">{task.assignee}</span>
            <span className="num w-14 shrink-0 text-right text-[11px] text-muted">
              {formatDate(task.dueDate, { month: "short", day: "numeric", year: undefined })}
            </span>
          </div>
        );
      })}
    </Section>
  );
}

export default function OverviewDashboard({ bundle, recentActivity = [], store }) {
  const [view, setView] = useState("separate");

  const project = bundle.project;
  const window = getReportingWindow(bundle.series);
  const performance = getPerformanceMetrics(bundle.series);
  const channels = getChannelLegend(bundle);
  const base = `/projects/${project.id}`;

  return (
    <div className="space-y-9">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="display text-[32px] text-ink sm:text-[38px]">{project.name}</h1>
          <p className="mt-2 text-[13.5px] text-muted">
            {project.type} · {project.clientName} · active since{" "}
            {formatDate(project.createdDate, { month: "long", year: "numeric", day: undefined })}
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          <div className="label">Reporting period</div>
          <div className="mt-2 text-[15px] font-semibold text-ink">{window.range}</div>
          <div className="label mt-1.5 normal-case tracking-normal">{window.comparison}</div>
        </div>
      </div>

      <StatStrip marks items={getKpiItems(bundle)} />

      <div className="grid gap-9 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Performance
          months={performance.months}
          metrics={performance.metrics}
          view={view}
          onViewChange={setView}
        />
        <ChannelBreakdown rows={channels.rows} leadTotal={channels.leadTotal} />
      </div>

      <div className="grid gap-9 xl:grid-cols-3">
        <Pipeline stages={getPipelineStages(bundle)} />
        <TopCampaigns rows={getCampaignRows(bundle)} href={`${base}/campaigns`} />
        <Activity
          items={recentActivity}
          members={store?.teamMembers || []}
          href={`${base}/leads`}
        />
      </div>

      <div className="grid gap-9 xl:grid-cols-2">
        <DueThisWeek
          tasks={bundle.upcomingTasks || bundle.tasks || []}
          href={`${base}/tasks`}
        />
        <div>
          <Section title="Note" bodyClassName="pt-4">
            <Frame marks className="p-5">
              <p className="max-w-prose text-[14px] leading-7 text-ink-soft">
                Lead conversion is up 23% on last month, carried by paid social. Cost
                per lead is the metric to watch — it sits above target for the third
                week.
              </p>
              <Link href={`${base}/reports`} className="btn btn-ghost mt-5">
                View insights
              </Link>
            </Frame>
          </Section>
        </div>
      </div>
    </div>
  );
}
