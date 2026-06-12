"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Badge from "@/components/Badge";
import Drawer from "@/components/Drawer";
import EmptyState from "@/components/EmptyState";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import {
  campaignStatuses,
  marketingChannels,
  panelClassName,
} from "@/components/project-modules/shared";

export default function CampaignsScreen({
  bundle,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
}) {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [sortBy, setSortBy] = useState("spent");
  const [campaignComposerOpen, setCampaignComposerOpen] = useState(false);
  const [campaignDraft, setCampaignDraft] = useState({
    name: "",
    channel: "Paid",
    status: "Scheduled",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    budget: "",
    spent: "",
    impressions: "",
    clicks: "",
    conversions: "",
  });
  const campaignDraftIsValid =
    campaignDraft.name.trim() &&
    campaignDraft.startDate &&
    campaignDraft.endDate;

  if (!bundle.campaigns.length) {
    return (
      <EmptyState
        title="No campaigns yet."
        description="This project does not have local campaign records yet."
      />
    );
  }

  const visibleCampaigns = bundle.campaigns
    .filter((item) => statusFilter === "All" || item.status === statusFilter)
    .filter((item) => channelFilter === "All" || item.channel === channelFilter)
    .slice()
    .sort((a, b) => {
      if (sortBy === "spent") {
        return b.spent - a.spent;
      }
      if (sortBy === "conversions") {
        return b.conversions - a.conversions;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <>
      <div className="space-y-6">
        <div className={cn(panelClassName, "space-y-5 p-5")}>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-sm text-slate-500">Campaigns</div>
              <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                {visibleCampaigns.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Budget</div>
              <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                {formatCurrency(
                  visibleCampaigns.reduce((sum, item) => sum + item.budget, 0),
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Spent</div>
              <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                {formatCurrency(
                  visibleCampaigns.reduce((sum, item) => sum + item.spent, 0),
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Conversions</div>
              <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                {visibleCampaigns.reduce((sum, item) => sum + item.conversions, 0)}
              </div>
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-4 rounded-[20px] border border-[#E4EBF7] bg-[#FBFDFF] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8FA0BE]">
                    Filters
                  </div>
                  <div className="mt-1 text-[14px] text-[#6E7F9F]">
                    Channel and lifecycle filters are independent from the lead board.
                  </div>
                </div>
                <div className="text-[13px] text-[#8A98B3]">
                  {visibleCampaigns.length} matching campaigns
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {["All", "Active", "Scheduled", "Ended"].map((item) => {
                    const active = statusFilter === item;
                    return (
                      <button
                        key={item}
                        onClick={() => setStatusFilter(item)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-semibold transition",
                          active
                            ? "border-ledger-blue bg-[#EEF4FF] text-ledger-blue"
                            : "border-[#E3EBF7] bg-white text-slate-500 hover:border-[#C9D8F2]",
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {["All", ...new Set(bundle.campaigns.map((item) => item.channel))].map(
                    (item) => {
                      const active = channelFilter === item;
                      return (
                        <button
                          key={item}
                          onClick={() => setChannelFilter(item)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm font-semibold transition",
                            active
                              ? "border-ledger-blue bg-[#EEF4FF] text-ledger-blue"
                              : "border-[#E3EBF7] bg-white text-slate-500 hover:border-[#C9D8F2]",
                          )}
                        >
                          {item}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3 rounded-[20px] border border-[#E4EBF7] bg-white p-4">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="ledger-select w-full"
              >
                <option value="spent">Sort by spent</option>
                <option value="conversions">Sort by conversions</option>
                <option value="name">Sort by name</option>
              </select>
              <button
                onClick={() => setCampaignComposerOpen(true)}
                className="ledger-button ledger-button-primary w-full"
              >
                + New Campaign
              </button>
            </div>
          </div>
        </div>
        <div className={cn(panelClassName, "overflow-hidden")}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  {[
                    "Name",
                    "Channel",
                    "Status",
                    "Budget",
                    "Spent",
                    "Impressions",
                    "Clicks",
                    "Conversions",
                  ].map((heading) => (
                    <th key={heading} className="px-6 py-4">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    onClick={() => setSelectedCampaign({ ...campaign })}
                    className="cursor-pointer border-t border-slate-100 transition hover:bg-ledger-mist/40"
                  >
                    <td className="px-6 py-4 font-medium text-ledger-ink">{campaign.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{campaign.channel}</td>
                    <td className="px-6 py-4">
                      <Badge tone={campaign.status}>{campaign.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatCurrency(campaign.budget)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatCurrency(campaign.spent)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatNumber(campaign.impressions)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatNumber(campaign.clicks)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{campaign.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Drawer
        open={Boolean(selectedCampaign)}
        onClose={() => setSelectedCampaign(null)}
        title={selectedCampaign?.name || "Campaign"}
      >
        {selectedCampaign ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
                <span className="mb-2 block">Campaign name</span>
                <input
                  value={selectedCampaign.name}
                  onChange={(event) =>
                    setSelectedCampaign((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="ledger-input"
                />
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Status</span>
                <select
                  value={selectedCampaign.status}
                  onChange={(event) =>
                    setSelectedCampaign((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  className="ledger-select"
                >
                  {campaignStatuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-ledger-ink">
                <span className="mb-2 block">Budget</span>
                <input
                  value={selectedCampaign.budget}
                  onChange={(event) =>
                    setSelectedCampaign((current) => ({
                      ...current,
                      budget: Number(event.target.value) || 0,
                    }))
                  }
                  className="ledger-input"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Budget", formatCurrency(selectedCampaign.budget)],
                ["Spent", formatCurrency(selectedCampaign.spent)],
                ["Clicks", formatNumber(selectedCampaign.clicks)],
                ["Conversions", selectedCampaign.conversions],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-ledger-border p-5"
                >
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[18px] border border-ledger-border p-5">
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Mini Chart
              </div>
              <div className="mt-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[1, 2, 3, 4, 5, 6].map((index) => ({
                      period: `W${index}`,
                      clicks: Math.round(selectedCampaign.clicks / 8 + index * 24),
                      conversions: Math.round(
                        selectedCampaign.conversions / 5 + index * 0.6,
                      ),
                    }))}
                  >
                    <CartesianGrid stroke="#e5edf9" vertical={false} />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} stroke="#8b9bb8" />
                    <YAxis axisLine={false} tickLine={false} stroke="#8b9bb8" />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#2B58E8" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="conversions" fill="#14B8A6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-[18px] border border-ledger-border p-5">
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Period Comparison
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[16px] bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Current period CTR</div>
                  <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                    {(
                      (selectedCampaign.clicks / Math.max(1, selectedCampaign.impressions)) *
                      100
                    ).toFixed(2)}
                    %
                  </div>
                </div>
                <div className="rounded-[16px] bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Spend pace</div>
                  <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ledger-ink">
                    {(
                      (selectedCampaign.spent / Math.max(1, selectedCampaign.budget)) *
                      100
                    ).toFixed(0)}
                    %
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={async () => {
                  await onDeleteCampaign(selectedCampaign.id);
                  setSelectedCampaign(null);
                }}
                className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete Campaign
              </button>
              <button
                disabled={!String(selectedCampaign.name).trim()}
                onClick={() => {
                  if (!String(selectedCampaign.name).trim()) {
                    return;
                  }
                  onUpdateCampaign(selectedCampaign.id, {
                    name: selectedCampaign.name,
                    status: selectedCampaign.status,
                    budget: selectedCampaign.budget,
                  });
                  setSelectedCampaign(null);
                }}
                className="ledger-button ledger-button-primary min-w-[160px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Campaign
              </button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={campaignComposerOpen}
        onClose={() => setCampaignComposerOpen(false)}
        title="New Campaign"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Campaign name</span>
            <input
              value={campaignDraft.name}
              onChange={(event) =>
                setCampaignDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Channel</span>
            <select
              value={campaignDraft.channel}
              onChange={(event) =>
                setCampaignDraft((current) => ({
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
              value={campaignDraft.status}
              onChange={(event) =>
                setCampaignDraft((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {campaignStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Start date</span>
            <input
              type="date"
              value={campaignDraft.startDate}
              onChange={(event) =>
                setCampaignDraft((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">End date</span>
            <input
              type="date"
              value={campaignDraft.endDate}
              onChange={(event) =>
                setCampaignDraft((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
              className="ledger-input"
            />
          </label>
          {["budget", "spent", "impressions", "clicks", "conversions"].map((field) => (
            <label key={field} className="text-sm font-medium text-ledger-ink">
              <span className="mb-2 block capitalize">{field}</span>
              <input
                value={campaignDraft[field]}
                onChange={(event) =>
                  setCampaignDraft((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                className="ledger-input"
              />
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            disabled={!campaignDraftIsValid}
            onClick={() => {
              if (!campaignDraftIsValid) {
                return;
              }
              onCreateCampaign(bundle.project.id, campaignDraft);
              setCampaignComposerOpen(false);
            }}
            className="ledger-button ledger-button-primary min-w-[160px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Campaign
          </button>
        </div>
      </Drawer>
    </>
  );
}
