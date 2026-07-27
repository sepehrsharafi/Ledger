"use client";

import { Avatar, Frame, Section, Toggle } from "@/components/ui";
import { AVATAR_FILL } from "@/lib/palette";
import { useSettingsData } from "@/lib/useLedgerData";

const NOTIFICATION_COPY = {
  approvals: "When an asset needs your decision.",
  reports: "When a client report sends or is opened.",
  tasks: "When a task is assigned to you.",
};

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-soft py-3.5">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold capitalize text-ink">{title}</div>
        <div className="mt-0.5 text-[11.5px] text-muted">{description}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

export default function SettingsPage() {
  const { store, toggleIntegration, toggleNotification } = useSettingsData();
  const settings = store.agencySettings;

  return (
    <div className="grid gap-9 xl:grid-cols-2">
      <div className="space-y-9">
        <Section title="Agency profile">
          <div className="flex items-center gap-3.5 border-b border-line-soft py-4">
            <Avatar
              name={settings.agencyName}
              color={AVATAR_FILL}
              className="h-10 w-10 text-[11px]"
            />
            <div className="min-w-0 flex-1">
              <div className="label">Agency name</div>
              <div className="mt-1 truncate text-[16px] font-semibold text-ink">
                {settings.agencyName}
              </div>
            </div>
            <button type="button" className="btn btn-ghost h-[26px] px-2.5">
              Edit
            </button>
          </div>
        </Section>

        <Section title="Notifications">
          {Object.entries(settings.notifications).map(([key, enabled]) => (
            <ToggleRow
              key={key}
              title={key}
              description={NOTIFICATION_COPY[key] || "Visual-only setting in this demo."}
              checked={enabled}
              onChange={() => toggleNotification(key)}
            />
          ))}
        </Section>
      </div>

      <div className="space-y-9">
        <Section title="Identity" bodyClassName="pt-4">
          <Frame marks className="p-6">
            <div className="label">Ledger</div>
            <p className="display mt-3 text-[24px] text-ink">Every client, on the record.</p>
            <p className="mt-2.5 text-[12px] text-muted">Primary application identity.</p>
          </Frame>
        </Section>

        <Section title="Integrations">
          {settings.integrations.map((integration) => (
            <ToggleRow
              key={integration.id}
              title={integration.name}
              description={integration.connected ? "Connected" : "Not connected"}
              checked={integration.connected}
              onChange={() => toggleIntegration(integration.id)}
            />
          ))}
        </Section>
      </div>
    </div>
  );
}
