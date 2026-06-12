"use client";

import { useState } from "react";
import { SectionCard } from "@/components/project-modules/shared";

export default function ProjectSettingsScreen({ bundle, store, onUpdateProject }) {
  const assignedMembers = store.teamMembers.filter((member) =>
    member.assignedProjectIds.includes(bundle.project.id),
  );
  const [form, setForm] = useState({
    name: bundle.project.name,
    clientName: bundle.project.clientName,
    type: bundle.project.type,
    brandPrimary: bundle.project.brandPrimary,
    brandAccent: bundle.project.brandAccent,
    status: bundle.project.status,
  });
  const formIsValid = Object.values(form).every(
    (value) => String(value).trim().length > 0,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <SectionCard title="Project Settings">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Project name", "name"],
            ["Client name", "clientName"],
            ["Type", "type"],
            ["Status", "status"],
          ].map(([label, key]) => (
            <label
              key={key}
              className={`text-sm font-medium text-ledger-ink ${key === "type" ? "sm:col-span-2" : ""}`}
            >
              <span className="mb-2 block">{label}</span>
              <input
                value={form[key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                className="ledger-input"
              />
            </label>
          ))}
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Brand primary color</span>
            <input
              type="color"
              value={form.brandPrimary}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  brandPrimary: event.target.value,
                }))
              }
              className="h-14 w-full rounded-[14px] border border-ledger-border bg-white p-2"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Brand accent color</span>
            <input
              type="color"
              value={form.brandAccent}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  brandAccent: event.target.value,
                }))
              }
              className="h-14 w-full rounded-[14px] border border-ledger-border bg-white p-2"
            />
          </label>
        </div>
        <button
          disabled={!formIsValid}
          onClick={() => onUpdateProject(bundle.project.id, form)}
          className="ledger-button ledger-button-primary mt-6 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Project Settings
        </button>
      </SectionCard>
      <div className="space-y-6">
        <SectionCard title="Live Brand Preview">
          <div
            className="rounded-[20px] p-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${form.brandPrimary}, ${form.brandAccent})`,
            }}
          >
            <div className="text-sm uppercase tracking-[0.2em] text-white/70">
              {form.clientName}
            </div>
            <div className="mt-3 text-3xl font-bold tracking-[-0.04em]">{form.name}</div>
            <div className="mt-2 text-white/80">{form.type}</div>
          </div>
        </SectionCard>
        <SectionCard title="Assigned Team Members">
          <div className="space-y-3">
            {assignedMembers.map((member) => (
              <div key={member.id} className="rounded-[16px] bg-slate-50 px-4 py-3">
                <div className="font-semibold text-ledger-ink">{member.name}</div>
                <div className="text-sm text-slate-500">{member.email}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
