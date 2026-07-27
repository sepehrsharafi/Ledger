"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { Field } from "@/components/ui";

const DEFAULTS = {
  name: "",
  clientName: "",
  type: "",
  brandPrimary: "#1F4BC5",
  brandAccent: "#111110",
};

const TEXT_FIELDS = [
  { key: "name", label: "Project name", placeholder: "Lumen Skincare" },
  { key: "clientName", label: "Client name", placeholder: "Lumen Labs" },
  {
    key: "type",
    label: "Type",
    placeholder: "DTC e-commerce brand launch",
    wide: true,
  },
];

const COLOR_FIELDS = [
  { key: "brandPrimary", label: "Primary colour" },
  { key: "brandAccent", label: "Accent colour" },
];

export default function ProjectFormModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(DEFAULTS);
  const isValid = form.name.trim() && form.clientName.trim() && form.type.trim();

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event?.preventDefault();
    if (!isValid) {
      return;
    }

    onSubmit(form);
    setForm(DEFAULTS);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="New project"
      title="New project"
      footer={[
        <button key="cancel" type="button" onClick={onClose} className="btn btn-ghost">
          Cancel
        </button>,
        <button
          key="create"
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className="btn btn-primary"
        >
          Create project
        </button>,
      ]}
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        {TEXT_FIELDS.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            className={field.wide ? "sm:col-span-2" : ""}
          >
            <input
              value={form[field.key]}
              onChange={(event) => update(field.key, event.target.value)}
              placeholder={field.placeholder}
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
      </form>
    </Modal>
  );
}
