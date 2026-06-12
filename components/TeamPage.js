"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import Drawer from "@/components/Drawer";
import { useAppContext } from "@/context/AppContext";

export default function TeamPage() {
  const { store } = useAppContext();
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <AppShell title="Team" subtitle="Agency capacity, ownership, and workload in one place.">
      <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-ledger-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned Projects</th>
              </tr>
            </thead>
            <tbody>
              {store.teamMembers.map((member) => (
                <tr key={member.id} onClick={() => setSelectedMember(member)} className="cursor-pointer border-b border-slate-100 transition hover:bg-ledger-mist/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: member.avatarColor }}>
                        {member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </div>
                      <div className="font-medium text-ledger-ink">{member.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{member.email}</td>
                  <td className="px-6 py-4"><Badge tone={member.role}>{member.role}</Badge></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{member.assignedProjectIds.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Drawer open={Boolean(selectedMember)} onClose={() => setSelectedMember(null)} title={selectedMember?.name || "Member"}>
        {selectedMember ? (
          <div className="space-y-6">
            <div className="rounded-[28px] bg-ledger-mist p-5">
              <div className="text-sm text-slate-500">{selectedMember.email}</div>
              <div className="mt-3"><Badge tone={selectedMember.role}>{selectedMember.role}</Badge></div>
            </div>
            <div className="rounded-[28px] border border-ledger-border p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Assigned Projects</h3>
              <div className="mt-4 space-y-3">
                {selectedMember.assignedProjectIds.map((projectId) => {
                  const project = store.projects.find((item) => item.id === projectId);
                  return (
                    <div key={projectId} className="rounded-2xl bg-slate-50 p-4">
                      <div className="font-medium text-ledger-ink">{project?.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{project?.clientName}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-ledger-border p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Workload</div>
                <div className="mt-3 text-3xl font-semibold text-ledger-ink">{selectedMember.assignedProjectIds.length}</div>
                <div className="mt-1 text-sm text-slate-500">active project assignments</div>
              </div>
              <div className="rounded-[28px] border border-ledger-border p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Focus</div>
                <div className="mt-3 text-base font-semibold text-ledger-ink">Client delivery and operations</div>
                <div className="mt-1 text-sm text-slate-500">Visible only in this local demo.</div>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </AppShell>
  );
}
