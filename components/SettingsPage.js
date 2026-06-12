"use client";

import AppShell from "@/components/AppShell";
import { useSettingsData } from "@/lib/useLedgerData";

function Toggle({ enabled, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-7 w-12 rounded-full transition ${enabled ? "bg-ledger-blue shadow-[0_8px_20px_rgba(43,88,232,0.2)]" : "bg-slate-200"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`} />
    </button>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <section className={`rounded-[22px] border border-[#E4EBF7] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)] ${className}`}>
      <h2 className="text-[18px] font-bold tracking-[-0.03em] text-ledger-ink">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { store, toggleIntegration, toggleNotification } = useSettingsData();
  const settings = store.agencySettings;

  return (
    <AppShell title="Settings" subtitle="Agency profile, branding defaults, notifications, and demo integrations.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.85fr]">
        <div className="space-y-6">
          <Panel title="Agency Profile">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[18px] bg-[#F7F9FC] px-5 py-5">
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8FA0BE]">Agency Name</div>
                <div className="mt-3 text-[18px] font-bold tracking-[-0.02em] text-ledger-ink">{settings.agencyName}</div>
              </div>
              <div className="rounded-[18px] bg-[#F7F9FC] px-5 py-5">
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8FA0BE]">Logo Placeholder</div>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-[12px] bg-ledger-blue text-[15px] font-bold text-white">
                  {settings.logoPlaceholder}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Notification Toggles">
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between rounded-[18px] border border-[#E4EBF7] px-4 py-4">
                  <div>
                    <div className="text-[17px] font-semibold capitalize text-ledger-ink">{key}</div>
                    <div className="mt-1 text-[14px] leading-6 text-[#64748B]">Visual only setting for the demo workspace.</div>
                  </div>
                  <Toggle enabled={enabled} onClick={() => toggleNotification(key)} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Default Branding">
            <div className="rounded-[20px] bg-gradient-to-br from-ledger-blue to-ledger-glow px-8 py-10 text-white">
              <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-blue-100">Ledger</div>
              <div className="mt-4 text-[24px] font-bold tracking-[-0.04em]">Every client, on the record.</div>
              <div className="mt-2 text-[14px] text-blue-100/90">Primary application identity preview.</div>
            </div>
          </Panel>

          <Panel title="Integrations">
            <div className="space-y-4">
              {settings.integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between rounded-[18px] border border-[#E4EBF7] px-4 py-4">
                  <div>
                    <div className="text-[17px] font-semibold text-ledger-ink">{integration.name}</div>
                    <div className="mt-1 text-[14px] leading-6 text-[#64748B]">{integration.connected ? "Connected in demo mode" : "Not connected"}</div>
                  </div>
                  <Toggle enabled={integration.connected} onClick={() => toggleIntegration(integration.id)} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
