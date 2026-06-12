"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "@/components/EmptyState";
import { formatCurrency, formatNumber, monthLabel } from "@/lib/utils";
import { SectionCard } from "@/components/project-modules/shared";

export default function ClientViewScreen({ bundle }) {
  if (!bundle.series.length) {
    return (
      <EmptyState
        title="No performance data yet."
        description="This client-facing view has no local data for the selected project yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/projects/${bundle.project.id}`}
        className="inline-flex rounded-[14px] border border-[#E4EBF7] bg-white px-4 py-2 text-sm font-semibold text-ledger-blue shadow-sm"
      >
        Back to dashboard
      </Link>
      <div className="rounded-[24px] border border-[#E4EBF7] bg-white p-5 shadow-ledger sm:p-8">
        <div
          className="rounded-[20px] p-6 text-white sm:p-8"
          style={{
            background: `linear-gradient(135deg, ${bundle.project.brandPrimary}, ${bundle.project.brandAccent})`,
          }}
        >
          <div className="text-sm uppercase tracking-[0.2em] text-white/70">
            {bundle.project.clientName}
          </div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            {bundle.project.name}
          </div>
          <div className="mt-2 text-white/80">Read-only client summary for Ledger.</div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[18px] bg-slate-50 p-5">
            <div className="text-sm text-slate-500">Traffic</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
              {formatNumber(bundle.kpis.traffic.current)}
            </div>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-5">
            <div className="text-sm text-slate-500">Conversions</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
              {bundle.kpis.conversions.current}
            </div>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-5">
            <div className="text-sm text-slate-500">Cost per Lead</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
              {formatCurrency(bundle.kpis.costPerLead.current)}
            </div>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-5">
            <div className="text-sm text-slate-500">ROI</div>
            <div className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ledger-ink">
              {bundle.kpis.roi.current.toFixed(2)}x
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Performance">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={bundle.series.map((item) => ({
                    ...item,
                    label: monthLabel(item.month),
                  }))}
                >
                  <CartesianGrid stroke="#e5edf9" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#8b9bb8" />
                  <YAxis axisLine={false} tickLine={false} stroke="#8b9bb8" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="traffic"
                    stroke={bundle.project.brandAccent}
                    fill={bundle.project.brandPrimary}
                    fillOpacity={0.25}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard title="Goals">
            <div className="space-y-4">
              {bundle.goals.map((goal) => (
                <div key={goal.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ledger-ink">{goal.label}</span>
                    <span className="text-slate-500">
                      {goal.currentValue}/{goal.targetValue}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%`,
                        backgroundColor: bundle.project.brandAccent,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
