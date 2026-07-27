"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import { Cell, Chip, Meter, Pill, Row, StatStrip, Table } from "@/components/ui";
import {
  CampaignComposerDrawer,
  CampaignDetailDrawer,
} from "@/components/project-modules/CampaignDrawers";
import { usePageAction } from "@/context/PageAction";
import { formatCurrency, formatNumber } from "@/lib/utils";

const STATUS_FILTERS = ["All", "Active", "Scheduled", "Ended"];

const COLUMNS = [
  { key: "campaign", label: "Campaign" },
  { key: "status", label: "Status" },
  { key: "pacing", label: "Pacing", width: "18%" },
  { key: "spend", label: "Spent / budget", align: "right" },
  { key: "impressions", label: "Impr.", align: "right" },
  { key: "clicks", label: "Clicks", align: "right" },
  { key: "ctr", label: "CTR", align: "right" },
  { key: "conversions", label: "Conv.", align: "right" },
];

const SORTS = {
  spent: (a, b) => b.spent - a.spent,
  conversions: (a, b) => b.conversions - a.conversions,
  name: (a, b) => a.name.localeCompare(b.name),
};

export default function CampaignsScreen({
  bundle,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
}) {
  const [draft, setDraft] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [sortBy, setSortBy] = useState("spent");
  const [composerOpen, setComposerOpen] = useState(false);

  usePageAction(() => setComposerOpen(true));

  const campaigns = bundle.campaigns || [];
  const channels = useMemo(
    () => ["All", ...new Set(campaigns.map((item) => item.channel))],
    [campaigns],
  );

  const visible = useMemo(
    () =>
      campaigns
        .filter((item) => statusFilter === "All" || item.status === statusFilter)
        .filter((item) => channelFilter === "All" || item.channel === channelFilter)
        .slice()
        .sort(SORTS[sortBy]),
    [campaigns, statusFilter, channelFilter, sortBy],
  );

  if (!campaigns.length) {
    return (
      <EmptyState
        title="No campaigns yet."
        description="This project does not have any campaign records yet."
      />
    );
  }

  const total = (key) => visible.reduce((sum, item) => sum + Number(item[key] || 0), 0);

  return (
    <>
      <div className="space-y-7">
        <StatStrip
          items={[
            { label: "Campaigns", value: visible.length },
            { label: "Budget", value: formatCurrency(total("budget")) },
            { label: "Spent", value: formatCurrency(total("spent")) },
            { label: "Conversions", value: formatNumber(total("conversions")) },
          ]}
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="label mr-1">Status</span>
            {STATUS_FILTERS.map((item) => (
              <Chip
                key={item}
                active={statusFilter === item}
                onClick={() => setStatusFilter(item)}
              >
                {item}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="label mr-1 lg:ml-3">Channel</span>
            {channels.map((item) => (
              <Chip
                key={item}
                active={channelFilter === item}
                onClick={() => setChannelFilter(item)}
              >
                {item}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-3 lg:ml-auto">
            <span className="label whitespace-nowrap">
              {visible.length} of {campaigns.length} shown
            </span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort campaigns"
              className="field w-[150px]"
            >
              <option value="spent">Sort: spend</option>
              <option value="conversions">Sort: conversions</option>
              <option value="name">Sort: name</option>
            </select>
          </div>
        </div>

        <Table columns={COLUMNS} className="min-w-0">
          {visible.map((campaign) => {
            const pace = (campaign.spent / Math.max(1, campaign.budget)) * 100;
            const ctr = campaign.impressions
              ? (campaign.clicks / campaign.impressions) * 100
              : 0;

            return (
              <Row key={campaign.id} onClick={() => setDraft({ ...campaign })}>
                <Cell>
                  <div className="text-[13px] font-semibold text-ink">{campaign.name}</div>
                  <div className="label mt-1">{campaign.channel}</div>
                </Cell>
                <Cell>
                  <Pill tone={campaign.status}>{campaign.status}</Pill>
                </Cell>
                <Cell>
                  <Meter value={pace} />
                  <div className="mt-1.5 text-[11px] text-muted">
                    {pace.toFixed(0)}% of budget
                  </div>
                </Cell>
                <Cell align="right" className="num whitespace-nowrap text-ink">
                  {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                </Cell>
                <Cell align="right" className="num">
                  {formatNumber(campaign.impressions)}
                </Cell>
                <Cell align="right" className="num">
                  {formatNumber(campaign.clicks)}
                </Cell>
                <Cell align="right" className="num">
                  {ctr ? `${ctr.toFixed(2)}%` : "—"}
                </Cell>
                <Cell align="right" className="num font-semibold text-ink">
                  {campaign.conversions}
                </Cell>
              </Row>
            );
          })}
        </Table>
      </div>

      <CampaignDetailDrawer
        campaign={draft}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
        onClose={() => setDraft(null)}
        onSave={() => {
          onUpdateCampaign(draft.id, {
            name: draft.name,
            status: draft.status,
            budget: draft.budget,
          });
          setDraft(null);
        }}
        onDelete={async () => {
          await onDeleteCampaign(draft.id);
          setDraft(null);
        }}
      />

      <CampaignComposerDrawer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreate={onCreateCampaign}
        projectId={bundle.project.id}
      />
    </>
  );
}
