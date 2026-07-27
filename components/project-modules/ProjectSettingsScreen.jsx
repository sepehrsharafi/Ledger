"use client";

import { useState } from "react";
import { Avatar, Field, Frame, Section } from "@/components/ui";
import { usePageAction } from "@/context/PageAction";

const TEXT_FIELDS = [
  { key: "name", label: "Project name" },
  { key: "clientName", label: "Client name" },
  { key: "type", label: "Type", wide: true },
  { key: "status", label: "Status" },
];

const COLOR_FIELDS = [
  { key: "brandPrimary", label: "Brand primary" },
  { key: "brandAccent", label: "Brand accent" },
];

export default function ProjectSettingsScreen({ bundle, store, onUpdateProject }) {
  const { project } = bundle;
  const [form, setForm] = useState({
    name: project.name,
    clientName: project.clientName,
    type: project.type,
    brandPrimary: project.brandPrimary,
    brandAccent: project.brandAccent,
    status: project.status,
  });

  const isValid = Object.values(form).every((value) => String(value).trim().length > 0);

  // The header's SAVE button commits this form.
  usePageAction(() => {
    if (isValid) {
      onUpdateProject(project.id, form);
    }
  });

  const assigned = store.teamMembers.filter((member) =>
    member.assignedProjectIds.includes(project.id),
  );

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-9 xl:grid-cols-2">
      <Section title="Identity" bodyClassName="pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {TEXT_FIELDS.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              className={field.wide ? "sm:col-span-2" : ""}
            >
              <input
                value={form[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
                className="field"
              />
            </Field>
          ))}
          {COLOR_FIELDS.map((field) => (
            <Field key={field.key} label={field.label}>
              <div className="flex h-[34px] items-center gap-2.5 border border-line px-2.5">
                <input
                  type="color"
                  value={form[field.key]}
                  onChange={(event) => update(field.key, event.target.value)}
                  aria-label={field.label}
                  className="h-[18px] w-[26px] cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="num text-[12px] uppercase text-muted">
                  {form[field.key]}
                </span>
              </div>
            </Field>
          ))}
        </div>
        <button
          type="button"
          disabled={!isValid}
          onClick={() => onUpdateProject(project.id, form)}
          className="btn btn-primary mt-5"
        >
          Save project
        </button>
      </Section>

      <div className="space-y-9">
        <Section title="Brand preview" bodyClassName="pt-4">
          <Frame marks className="p-6">
            <div className="flex gap-px">
              {[form.brandPrimary, form.brandAccent].map((color) => (
                <span key={color} className="h-8 flex-1" style={{ backgroundColor: color }} />
              ))}
            </div>
            <div className="label mt-5">{form.clientName}</div>
            <p className="display mt-2 text-[24px] text-ink">{form.name}</p>
            <p className="mt-2 text-[12.5px] text-muted">{form.type}</p>
          </Frame>
        </Section>

        <Section title="Assigned team">
          {assigned.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 border-b border-line-soft py-3"
            >
              <Avatar name={member.name} color={member.avatarColor} className="h-7 w-7" />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-ink">
                  {member.name}
                </div>
                <div className="mt-0.5 truncate text-[11.5px] text-muted">{member.email}</div>
              </div>
            </div>
          ))}
          {assigned.length ? null : (
            <p className="py-4 text-[13px] text-muted">No one is assigned yet.</p>
          )}
        </Section>
      </div>
    </div>
  );
}
