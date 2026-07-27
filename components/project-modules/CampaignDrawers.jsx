"use client";

import { useState } from "react";
import Drawer from "@/components/Drawer";
import { Field, Section, StatStrip } from "@/components/ui";
import {
  campaignStatuses,
  marketingChannels,
} from "@/components/project-modules/shared";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { SERIES } from "@/lib/palette";

const NUMBER_FIELDS = ["budget", "spent", "impressions", "clicks", "conversions"];

/** Six-week clicks-versus-conversions read, drawn as plain bars. */
function MiniBars({ clicks, conversions }) {
  const weeks = [1, 2, 3, 4, 5, 6].map((week) => ({
    week,
    clicks: Math.round(clicks / 8 + week * 24),
    conversions: Math.round(conversions / 5 + week * 0.6),
  }));
  const peak = Math.max(1, ...weeks.map((item) => item.clicks));

  return (
    <div className="flex h-[150px] items-end gap-3 border-b border-line pt-2">
      {weeks.map((item) => (
        <div key={item.week} className="flex h-full flex-1 flex-col justify-end">
          <div className="flex h-full items-end gap-[3px]">
            <span
              className="flex-1 bg-ink"
              style={{ height: `${(item.clicks / peak) * 100}%` }}
            />
            <span
              className="flex-1"
              style={{
                height: `${(item.conversions / peak) * 100}%`,
                backgroundColor: SERIES.light,
              }}
            />
          </div>
          <span className="label pt-1.5 text-center">W{item.week}</span>
        </div>
      ))}
    </div>
  );
}

export function CampaignDetailDrawer({ campaign, onChange, onClose, onSave, onDelete }) {
  if (!campaign) {
    return <Drawer open={false} onClose={onClose} eyebrow="Campaign" />;
  }

  const ctr = (campaign.clicks / Math.max(1, campaign.impressions)) * 100;
  const pace = (campaign.spent / Math.max(1, campaign.budget)) * 100;

  return (
    <Drawer open onClose={onClose} eyebrow="Campaign" title={campaign.name}>
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Campaign name" className="sm:col-span-2">
            <input
              value={campaign.name}
              onChange={(event) => onChange({ name: event.target.value })}
              className="field"
            />
          </Field>
          <Field label="Status">
            <select
              value={campaign.status}
              onChange={(event) => onChange({ status: event.target.value })}
              className="field"
            >
              {campaignStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Budget">
            <input
              type="number"
              value={campaign.budget}
              onChange={(event) => onChange({ budget: Number(event.target.value) || 0 })}
              className="field"
            />
          </Field>
        </div>

        <StatStrip
          items={[
            { label: "Spent", value: formatCurrency(campaign.spent) },
            { label: "Clicks", value: formatNumber(campaign.clicks) },
            { label: "CTR", value: `${ctr.toFixed(2)}%` },
            { label: "Pace", value: `${pace.toFixed(0)}%` },
          ]}
        />

        <Section title="Clicks vs conversions" bodyClassName="pt-2">
          <MiniBars clicks={campaign.clicks} conversions={campaign.conversions} />
        </Section>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onDelete} className="btn btn-danger">
            Delete
          </button>
          <button
            type="button"
            disabled={!String(campaign.name).trim()}
            onClick={onSave}
            className="btn btn-primary"
          >
            Save campaign
          </button>
        </div>
      </div>
    </Drawer>
  );
}

export function CampaignComposerDrawer({ open, onClose, onCreate, projectId }) {
  const [draft, setDraft] = useState(emptyDraft);
  const isValid = draft.name.trim() && draft.startDate && draft.endDate;

  function update(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function close() {
    setDraft(emptyDraft());
    onClose();
  }

  return (
    <Drawer open={open} onClose={close} eyebrow="New campaign" title="New campaign">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Campaign name" className="sm:col-span-2">
          <input
            value={draft.name}
            onChange={(event) => update({ name: event.target.value })}
            className="field"
          />
        </Field>
        <Field label="Channel">
          <select
            value={draft.channel}
            onChange={(event) => update({ channel: event.target.value })}
            className="field"
          >
            {marketingChannels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={draft.status}
            onChange={(event) => update({ status: event.target.value })}
            className="field"
          >
            {campaignStatuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Start date">
          <input
            type="date"
            value={draft.startDate}
            onChange={(event) => update({ startDate: event.target.value })}
            className="field"
          />
        </Field>
        <Field label="End date">
          <input
            type="date"
            value={draft.endDate}
            onChange={(event) => update({ endDate: event.target.value })}
            className="field"
          />
        </Field>
        {NUMBER_FIELDS.map((field) => (
          <Field key={field} label={field}>
            <input
              type="number"
              value={draft[field]}
              onChange={(event) => update({ [field]: event.target.value })}
              className="field"
            />
          </Field>
        ))}
      </div>
      <button
        type="button"
        disabled={!isValid}
        onClick={() => {
          onCreate(projectId, draft);
          close();
        }}
        className="btn btn-primary mt-5 w-full"
      >
        Save campaign
      </button>
    </Drawer>
  );
}

function emptyDraft() {
  const today = new Date().toISOString().slice(0, 10);

  return {
    name: "",
    channel: "Paid",
    status: "Scheduled",
    startDate: today,
    endDate: today,
    budget: "",
    spent: "",
    impressions: "",
    clicks: "",
    conversions: "",
  };
}
