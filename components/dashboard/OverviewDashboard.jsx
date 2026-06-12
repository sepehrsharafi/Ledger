"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  monthLabel,
} from "@/lib/utils";
import { CalendarIcon } from "@/components/dashboard/DashboardIcons";
import Link from "next/link";

const chartPalette = {
  leadRate: "#2B58E8",
  conversionRate: "#20B4C7",
  costPerLead: "#FF7C8C",
};

const donutPalette = [
  "#2B58E8",
  "#1DB6D0",
  "#10B981",
  "#FB923C",
  "#8B5CF6",
  "#CBD5E1",
];

const channelLabelMap = {
  Search: "Organic Search",
  Social: "Paid Social",
  Email: "Email",
  Paid: "Google Ads",
};

function StatIcon({ kind }) {
  const icons = {
    leads: (
      <path d="M7.75 8.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm5.5 1.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5ZM3.5 15.75c.55-2 2.08-3.25 4.25-3.25s3.7 1.25 4.25 3.25M11.5 15.75c.35-1.28 1.35-2.1 2.75-2.1 1.07 0 1.98.47 2.65 1.4" />
    ),
    conversions: (
      <>
        <circle cx="10" cy="10" r="5.5" />
        <path
          d="m10 7.5 1.9 1.2v2.45L10 12.5l-1.9-1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
    cpl: (
      <>
        <path
          d="M8 6.25h8M8 17.75h8M12 6.25v11.5M7 9.25c0-1.1.9-2 2-2h1m-3 7.5c0 1.1.9 2 2 2h1"
          strokeLinecap="round"
        />
      </>
    ),
    roi: (
      <>
        <path d="M12 4a8 8 0 1 0 8 8" />
        <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#F4F7FF] text-ledger-blue">
      <svg
        viewBox="0 0 20 20"
        className="h-4.5 w-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        {icons[kind]}
      </svg>
    </div>
  );
}

function SectionCard({ title, action, className = "", children }) {
  return (
    <section className={`ledger-card rounded-[20px] p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ledger-ink">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function MiniSparkline({ data }) {
  return (
    <div className="mt-4 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.map((value, index) => ({ index, value }))}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2B58E8"
            strokeWidth={2.2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  change,
  comparison,
  sparkline,
  valueClassName = "",
}) {
  return (
    <div className="ledger-card rounded-[18px] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(43,88,232,0.08)]">
      <div className="flex items-center gap-3">
        <StatIcon kind={icon} />
        <span className="text-[15px] font-semibold text-ledger-ink">
          {label}
        </span>
      </div>
      <div className="mt-5 flex items-end gap-3">
        <div
          className={`text-[20px] font-bold tracking-[-0.03em] text-ledger-ink md:text-[22px] ${valueClassName}`}
        >
          {value}
        </div>
        <div className="pb-1 text-[14px] font-semibold text-emerald-500">
          {change}
        </div>
      </div>
      <MiniSparkline data={sparkline} />
      <p className="mt-3 text-[13px] text-[#8B9AB7]">{comparison}</p>
    </div>
  );
}

function avatarForMember(store, author) {
  const member = store.teamMembers.find((item) => item.name === author);
  if (!member) {
    return { initials: author.slice(0, 2).toUpperCase(), color: "#CBD5E1" };
  }

  return {
    initials: member.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2),
    color: member.avatarColor,
  };
}

function channelLegendData(bundle) {
  if (bundle.project.id === "lumen-skincare") {
    return [
      { name: "Paid Social", value: 42 },
      { name: "Google Ads", value: 24 },
      { name: "Organic Search", value: 18 },
      { name: "Email", value: 8 },
      { name: "Direct", value: 5 },
      { name: "Other", value: 3 },
    ];
  }

  const base = bundle.channels.map((item) => ({
    name: channelLabelMap[item.channel] || item.channel,
    raw: item.visits,
  }));
  const total = base.reduce((sum, item) => sum + item.raw, 0) || 1;
  const normalized = base.map((item) => ({
    name: item.name,
    value: Math.round((item.raw / total) * 100),
  }));
  const currentTotal = normalized.reduce((sum, item) => sum + item.value, 0);
  if (currentTotal < 100) {
    normalized.push({ name: "Other", value: 100 - currentTotal });
  }
  return normalized;
}

function campaignAccent(index) {
  return ["#2B58E8", "#22C1D6", "#18B981", "#8B5CF6"][index] || "#2B58E8";
}

function formatRangeDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getReportingWindow(series = []) {
  const lastPoint = series.at(-1);
  const baseDate = lastPoint?.month ? new Date(lastPoint.month) : new Date();
  const activeMonth = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() - 1,
    1,
  );
  const comparisonMonth = new Date(
    activeMonth.getFullYear(),
    activeMonth.getMonth() - 1,
    1,
  );
  const activeEnd = new Date(
    activeMonth.getFullYear(),
    activeMonth.getMonth() + 1,
    0,
  );
  const comparisonEnd = new Date(
    comparisonMonth.getFullYear(),
    comparisonMonth.getMonth() + 1,
    0,
  );

  return {
    rangeLabel: `${formatRangeDate(activeMonth)} - ${formatRangeDate(activeEnd)}`,
    comparisonLabel: `vs ${formatRangeDate(comparisonMonth)} - ${formatRangeDate(comparisonEnd)}`,
  };
}

export default function OverviewDashboard({ bundle, recentActivity, store }) {
  const totalLeads = bundle.leadCount ?? bundle.leads.length;
  const previousLeadCount =
    bundle.series.at(-2)?.leads || Math.max(1, totalLeads - 20);
  const leadChange =
    ((totalLeads - previousLeadCount) / previousLeadCount) * 100;
  const channelLegend = channelLegendData(bundle);
  const donutData = channelLegend.map((item, index) => ({
    ...item,
    fill: donutPalette[index],
  }));
  const reportingWindow = getReportingWindow(bundle.series);
  const performanceSeries = bundle.series.map((item) => ({
    ...item,
    label: monthLabel(item.month),
    leadRate: item.spend ? (item.leads / item.spend) * 1000 : 0,
    conversionRate: item.leads ? (item.conversions / item.leads) * 100 : 0,
    costPerLeadRate: item.leads ? item.spend / Math.max(1, item.leads) : 0,
  }));
  const funnelStages = [
    { label: "New", count: totalLeads, percent: "100%" },
    {
      label: "Contacted",
      count: Math.round(totalLeads * 0.656),
      percent: "65.6%",
    },
    {
      label: "Qualified",
      count: Math.round(totalLeads * 0.328),
      percent: "32.8%",
    },
    {
      label: "Proposal Sent",
      count: Math.round(totalLeads * 0.141),
      percent: "14.1%",
    },
    { label: "Won", count: Math.round(totalLeads * 0.094), percent: "9.4%" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-ledger-ink">
            Good morning, Alex
          </h1>
          <p className="mt-1 text-[17px] text-[#6E7F9F]">
            Here&apos;s what&apos;s happening with {bundle.project.name} today.
          </p>
        </div>
        <div className="justify-self-start rounded-[16px] border border-[#E3EBF7] bg-white px-4 py-3 xl:justify-self-end">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8FA0BE]">
            Reporting period
          </div>
          <div className="mt-1 flex items-center gap-2 text-[16px] font-semibold text-ledger-ink">
            <CalendarIcon className="h-4.5 w-4.5 text-slate-500" />
            <span>{reportingWindow.rangeLabel}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_280px] xl:grid-rows-[auto_auto]">
        <div className="grid gap-4 md:grid-cols-2 xl:col-span-2 xl:grid-cols-4">
          <KpiCard
            icon="leads"
            label="Total Leads"
            value={formatNumber(totalLeads)}
            change={`Up ${leadChange.toFixed(1)}%`}
            comparison={reportingWindow.comparisonLabel}
            sparkline={bundle.series.map((item) => item.leads)}
          />
          <KpiCard
            icon="conversions"
            label="Conversions"
            value={formatNumber(bundle.kpis.conversions.current)}
            change="Up 23.4%"
            comparison={reportingWindow.comparisonLabel}
            sparkline={bundle.kpis.conversions.sparkline}
          />
          <KpiCard
            icon="cpl"
            label="Cost per Lead"
            value={formatCurrency(bundle.kpis.costPerLead.current, "USD")}
            change="Down 8.3%"
            comparison={reportingWindow.comparisonLabel}
            sparkline={bundle.kpis.costPerLead.sparkline}
          />
          <KpiCard
            icon="roi"
            label="ROI"
            value={`${bundle.kpis.roi.current.toFixed(2)}x`}
            change="Up 12.7%"
            comparison={reportingWindow.comparisonLabel}
            sparkline={bundle.kpis.roi.sparkline}
          />
        </div>

        <SectionCard
          title="Recent Activity"
          action={
            <Link
              href={`/projects/${bundle.project.id}/leads`}
              className="text-[13px] font-semibold text-ledger-blue"
            >
              View all
            </Link>
          }
          className="xl:row-span-2 xl:pb-4"
        >
          <div className="space-y-5">
            {recentActivity.slice(0, 5).map((item, index) => {
              const avatar = avatarForMember(store, item.author);
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                    style={{ backgroundColor: avatar.color }}
                  >
                    {avatar.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-[15px] font-semibold text-ledger-ink">
                        {item.author}
                      </div>
                      <div className="whitespace-nowrap text-[12px] text-[#8B9AB7]">
                        {index === 0
                          ? "2m ago"
                          : index === 1
                            ? "15m ago"
                            : index === 2
                              ? "1h ago"
                              : index === 3
                                ? "2h ago"
                                : "3h ago"}
                      </div>
                    </div>
                    <p className="mt-1 text-[14px] leading-6 text-[#6E7F9F]">
                      {item.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Performance Overview"
          action={
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-4 text-[13px] text-slate-500 md:flex">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2B58E8]" />
                  Lead rate
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#20B4C7]" />
                  Conversion rate
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF7C8C]" />
                  Cost per lead
                </span>
              </div>
              <button className="ledger-button ledger-button-secondary h-10 rounded-[12px] px-3 text-[13px] font-medium text-[#6E7F9F]">
                Last 12 months
              </button>
            </div>
          }
        >
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performanceSeries}
                margin={{ top: 10, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="overviewArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2B58E8" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#2B58E8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEF3FB" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="leadRate"
                  stroke={chartPalette.leadRate}
                  fill="url(#overviewArea)"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  stroke={chartPalette.conversionRate}
                  strokeWidth={2.4}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="costPerLeadRate"
                  stroke={chartPalette.costPerLead}
                  strokeWidth={2.2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Leads by Channel" className="relative">
          <div className="flex items-center gap-4">
            <div className="relative flex h-[244px] w-[244px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={68}
                    outerRadius={98}
                    stroke="none"
                    paddingAngle={2}
                  >
                    {donutData.map((item) => (
                      <Cell key={item.name} fill={item.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-[30px] font-bold tracking-[-0.03em] text-ledger-ink">
                  {totalLeads}
                </div>
                <div className="mt-1 text-[14px] text-slate-500">
                  Total Leads
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {channelLegend.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 text-[14px]"
                >
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: donutPalette[index] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium text-ledger-ink">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr_1fr]">
        <SectionCard
          title="Top Campaigns"
          action={
            <Link
              href={`/projects/${bundle.project.id}/campaigns`}
              className="text-[13px] font-semibold text-ledger-blue"
            >
              View all
            </Link>
          }
        >
          <div className="grid grid-cols-[1.8fr_0.6fr_0.8fr_0.6fr] gap-3 px-1 pb-3 text-[12px] uppercase tracking-[0.12em] text-slate-400">
            <span>Campaign</span>
            <span>Leads</span>
            <span>Conversions</span>
            <span>ROI</span>
          </div>
          <div className="space-y-4">
            {(bundle.topCampaigns || bundle.campaigns).map((campaign, index) => (
              <div
                key={campaign.id}
                className="grid grid-cols-[1.8fr_0.6fr_0.8fr_0.6fr_0.28fr] items-center gap-3 text-[14px]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: campaignAccent(index) }}
                  >
                    {campaign.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-semibold text-ledger-ink">
                      {campaign.name}
                    </div>
                    <div className="mt-0.5 text-[13px] text-slate-500">
                      {campaign.channel === "Paid"
                        ? "Paid Social"
                        : campaign.channel === "Social"
                          ? "Google Ads"
                          : campaign.channel === "Email"
                            ? "Email Marketing"
                            : "Organic Search"}
                    </div>
                  </div>
                </div>
                <div className="text-slate-600">
                  {Math.max(20, Math.round(campaign.conversions * 0.29))}
                </div>
                <div className="text-slate-600">
                  {Math.max(5, Math.round(campaign.conversions * 0.085))}
                </div>
                <div className="text-slate-600">
                  {(campaign.spent
                    ? (campaign.clicks / campaign.spent) * 3
                    : 0
                  ).toFixed(2)}
                  x
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${55 + index * 12}%`,
                      backgroundColor: campaignAccent(index),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Lead Funnel"
          action={
            <Link
              href={`/projects/${bundle.project.id}/leads`}
              className="text-[13px] font-semibold text-ledger-blue"
            >
              View full report
            </Link>
          }
        >
          <div className="space-y-4">
            {funnelStages.map((stage, index) => (
              <div
                key={stage.label}
                className="grid grid-cols-[1fr_auto] items-center gap-3"
              >
                <div className="h-8 rounded-xl bg-slate-100">
                  <div
                    className="flex h-8 items-center justify-between rounded-xl px-3 text-[13px] font-medium"
                    style={{
                      width: `${100 - index * 15}%`,
                      color: index === 0 ? "#fff" : "#183153",
                      background: [
                        "linear-gradient(90deg,#3C72FF,#2B58E8)",
                        "linear-gradient(90deg,#C8DAFF,#B3CEFF)",
                        "linear-gradient(90deg,#D7EEFF,#C2E6FF)",
                        "linear-gradient(90deg,#D9F8F1,#C9F0E5)",
                        "linear-gradient(90deg,#E8E1FF,#DDD4FB)",
                      ][index],
                    }}
                  >
                    <span>{stage.label}</span>
                    <span>{stage.count}</span>
                  </div>
                </div>
                <div className="text-[13px] font-medium text-ledger-ink">
                  {stage.percent}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Upcoming Tasks"
          action={
            <Link
              href={`/projects/${bundle.project.id}/tasks`}
              className="text-[13px] font-semibold text-ledger-blue"
            >
              View all
            </Link>
          }
        >
          <div className="space-y-3">
            {(bundle.upcomingTasks || bundle.tasks).map((task, index) => {
                const done = task.column === "Done";
                return (
                  <div
                    key={task.id}
                    className="rounded-[16px] border border-[#E6EDF8] bg-[#FBFDFF] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                            done
                              ? "border-ledger-blue bg-ledger-blue text-white"
                              : "border-[#D7E2F4] bg-white"
                          }`}
                        >
                          {done ? (
                            <svg
                              viewBox="0 0 20 20"
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                            >
                              <path
                                d="m5.5 10.25 2.8 2.8 6.2-6.55"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : null}
                        </span>
                        <div>
                          <div
                            className={`text-[14px] font-medium ${
                              done ? "text-slate-400 line-through" : "text-ledger-ink"
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="mt-1 text-[12px] text-slate-500">
                            {task.assignee}
                            {task.description ? ` · ${task.description}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {index === 0
                            ? "Today"
                            : index === 1
                              ? "Tomorrow"
                              : formatDate(task.dueDate, {
                                  month: "short",
                                  day: "numeric",
                                })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </SectionCard>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-[18px] border border-[#DCE7F8] bg-[#F7FAFF] px-5 py-4 shadow-[0_8px_24px_rgba(43,88,232,0.04)] md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-ledger-blue shadow-sm">
            *
          </div>
          <p className="text-[15px] text-[#5E6E90]">
            You&apos;re doing great! Your lead conversion rate is up 23%
            compared to last month.
          </p>
        </div>
        <button className="ledger-button ledger-button-primary h-10 rounded-[12px] px-5 text-[14px]">
          View Insights &gt;
        </button>
      </div>
    </div>
  );
}
