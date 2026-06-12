"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

const defaults = {
  name: "",
  clientName: "",
  type: "",
  brandPrimary: "#2B58E8",
  brandAccent: "#0E1A3A",
};

export default function ProjectFormModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(defaults);

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name || !form.clientName || !form.type) {
      return;
    }
    onSubmit(form);
    setForm(defaults);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Project"
      footer={[
        <button key="cancel" onClick={onClose} className="ledger-button ledger-button-secondary h-10 px-4 text-sm text-slate-600">
          Cancel
        </button>,
        <button key="create" onClick={handleSubmit} className="ledger-button ledger-button-primary h-10 px-5 text-sm">
          Create Project
        </button>,
      ]}
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        {[
          ["Project name", "name", "Lumen Skincare"],
          ["Client name", "clientName", "Lumen Labs"],
          ["Type", "type", "DTC e-commerce brand launch"],
        ].map(([label, key, placeholder]) => (
          <label key={key} className={`text-sm font-medium text-ledger-ink ${key === "type" ? "sm:col-span-2" : ""}`}>
            <span className="mb-2 block">{label}</span>
            <input
              value={form[key]}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              placeholder={placeholder}
              className="ledger-input"
            />
          </label>
        ))}
        {[
          ["Primary color", "brandPrimary"],
          ["Accent color", "brandAccent"],
        ].map(([label, key]) => (
          <label key={key} className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">{label}</span>
            <div className="flex items-center gap-3 rounded-[14px] border border-ledger-border px-4 py-3">
              <input
                type="color"
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                className="h-10 w-12 rounded-[10px] border-0 bg-transparent p-0"
              />
              <span className="text-sm text-slate-500">{form[key]}</span>
            </div>
          </label>
        ))}
      </form>
    </Modal>
  );
}
