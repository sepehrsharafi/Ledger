"use client";

import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { MonthAxis, TrendArea } from "@/components/dashboard/Trend";
import { Meter, Section, StatStrip } from "@/components/ui";
import { formatCurrency, formatDecimal, formatNumber, monthLabel } from "@/lib/utils";

export default function ClientViewScreen({ bundle }) {
  if (!bundle.series.length) {
    return (
      <EmptyState
        title="No performance data yet."
        description="This client-facing view has no data for the selected project yet."
      />
    );
  }

  const { project, kpis, series, goals } = bundle;

  return (
    <div className="space-y-9">
      <div className="flex items-start justify-between gap-4 border-b border-edge pb-5">
        <div className="min-w-0">
          <div className="label">{project.clientName}</div>
          <h1 className="display mt-2.5 text-[32px] text-ink">{project.name}</h1>
          <p className="mt-2 text-[13px] text-muted">Read-only client summary.</p>
        </div>
        <Link href={`/projects/${project.id}`} className="btn btn-ghost shrink-0">
          Back
        </Link>
      </div>

      <StatStrip
        marks
        items={[
          { label: "Traffic", value: formatNumber(kpis.traffic.current) },
          { label: "Conversions", value: formatNumber(kpis.conversions.current) },
          { label: "Cost per lead", value: formatCurrency(kpis.costPerLead.current) },
          {
            label: "Return on spend",
            value: `${formatDecimal(kpis.roi.current, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}×`,
          },
        ]}
      />

      <div className="grid gap-9 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Section title="Traffic · 12 months" bodyClassName="pt-4">
          <TrendArea
            values={series.map((point) => point.traffic)}
            color={project.brandPrimary}
            height={210}
          />
          <MonthAxis months={series.map((point) => monthLabel(point.month))} />
        </Section>

        <Section title="Goals">
          {goals.map((goal) => (
            <div key={goal.label} className="border-b border-line-soft py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-ink">{goal.label}</span>
                <span className="num text-[12px] text-muted">
                  {goal.currentValue}/{goal.targetValue}
                </span>
              </div>
              <Meter
                value={(goal.currentValue / goal.targetValue) * 100}
                tone={project.brandPrimary}
                className="mt-2.5"
              />
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}
