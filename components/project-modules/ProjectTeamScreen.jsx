"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  subtlePanelClassName,
} from "@/components/project-modules/shared";

export default function ProjectTeamScreen({ bundle, store, onToggleAssignment }) {
  const assignedMembers = store.teamMembers.filter((member) =>
    member.assignedProjectIds.includes(bundle.project.id),
  );
  const unassignedMembers = store.teamMembers.filter(
    (member) => !member.assignedProjectIds.includes(bundle.project.id),
  );
  const [pendingUnassign, setPendingUnassign] = useState(null);

  async function handleAssignmentToggle(memberId, options = {}) {
    const result = await onToggleAssignment(memberId, options);
    if (result?.status === "requires-confirmation") {
      setPendingUnassign(result);
    } else if (result?.status === "updated") {
      setPendingUnassign(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn(subtlePanelClassName, "p-5")}>
          <div className="text-sm text-slate-500">Assigned Members</div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
            {assignedMembers.length}
          </div>
        </div>
        <div className={cn(subtlePanelClassName, "p-5")}>
          <div className="text-sm text-slate-500">Available Team</div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
            {store.teamMembers.length}
          </div>
        </div>
        <div className={cn(subtlePanelClassName, "p-5")}>
          <div className="text-sm text-slate-500">Unassigned</div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
            {unassignedMembers.length}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Assigned People">
          <div className="space-y-3">
            {assignedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-[18px] border border-ledger-border px-4 py-3"
              >
                <div className="flex items-center gap-3 text-left">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-ledger-ink">{member.name}</div>
                    <div className="text-sm text-slate-500">{member.role} · {member.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleAssignmentToggle(member.id)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  Unassign
                </button>
              </div>
            ))}
            {!assignedMembers.length ? (
              <div className="rounded-[18px] bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No one is assigned to this project yet.
              </div>
            ) : null}
          </div>
        </SectionCard>
        <SectionCard title="Available People">
          <div className="space-y-3">
            {unassignedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-[18px] border border-ledger-border px-4 py-3"
              >
                <div className="flex items-center gap-3 text-left">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-ledger-ink">{member.name}</div>
                    <div className="text-sm text-slate-500">{member.role} · {member.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleAssignmentToggle(member.id)}
                  className="rounded-full border border-ledger-blue/20 bg-[#EEF4FF] px-3 py-2 text-sm font-semibold text-ledger-blue transition hover:bg-[#DDE8FF]"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <Modal
        open={Boolean(pendingUnassign)}
        onClose={() => setPendingUnassign(null)}
        title="Unassign Team Member?"
        footer={
          <>
            <button
              onClick={() => setPendingUnassign(null)}
              className="ledger-button-secondary rounded-[14px] px-4 py-2 text-sm text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleAssignmentToggle(pendingUnassign.member.id, {
                  force: true,
                })
              }
              className="rounded-[14px] bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Unassign Anyway
            </button>
          </>
        }
      >
        {pendingUnassign ? (
          <div className="space-y-4">
            <p className="text-[15px] leading-7 text-[#5E6E90]">
              {pendingUnassign.member.name} still has {pendingUnassign.taskCount} task
              {pendingUnassign.taskCount === 1 ? "" : "s"} assigned in this project.
              Confirm before removing them from the team.
            </p>
            <div className="rounded-[18px] bg-[#F8FAFD] p-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8FA0BE]">
                Assigned Tasks
              </div>
              <div className="mt-3 space-y-2">
                {pendingUnassign.assignedTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[14px] border border-[#E4EBF7] bg-white px-3 py-3 text-sm text-ledger-ink"
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
