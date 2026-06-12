"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import Drawer from "@/components/Drawer";
import Modal from "@/components/Modal";
import { useTeamPageData } from "@/lib/useLedgerData";

export default function TeamPage() {
  const { store, toggleTeamMemberAssignment } = useTeamPageData();
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [pendingUnassign, setPendingUnassign] = useState(null);

  useEffect(() => {
    if (!selectedProjectId && store.projects[0]?.id) {
      setSelectedProjectId(store.projects[0].id);
    }
  }, [selectedProjectId, store.projects]);

  const selectedProject = useMemo(
    () => store.projects.find((project) => project.id === selectedProjectId),
    [selectedProjectId, store.projects],
  );

  const assignedMembers = store.teamMembers.filter((member) =>
    member.assignedProjectIds.includes(selectedProjectId),
  );
  const availableMembers = store.teamMembers.filter(
    (member) => !member.assignedProjectIds.includes(selectedProjectId),
  );

  async function handleAssignmentToggle(memberId, options = {}) {
    const result = await toggleTeamMemberAssignment(
      selectedProjectId,
      memberId,
      options,
    );

    if (result?.status === "requires-confirmation") {
      setPendingUnassign(result);
    } else if (result?.status === "updated") {
      setPendingUnassign(null);
    }
  }

  return (
    <AppShell title="Team" subtitle="Agency capacity, ownership, and workload in one place.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#E4EBF7] bg-white p-5">
          <div>
            <div className="text-sm uppercase tracking-[0.18em] text-[#8FA0BE]">
              Capacity view
            </div>
            <div className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-ledger-ink">
              {selectedProject?.name || "Select a project"}
            </div>
            <div className="mt-1 text-[14px] text-slate-500">
              Assign and unassign people against a specific project.
            </div>
          </div>
          <select
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            className="ledger-select min-w-[240px]"
          >
            {store.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#E4EBF7] bg-white p-5">
            <div className="text-sm text-slate-500">Assigned</div>
            <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
              {assignedMembers.length}
            </div>
          </div>
          <div className="rounded-[24px] border border-[#E4EBF7] bg-white p-5">
            <div className="text-sm text-slate-500">Available</div>
            <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
              {availableMembers.length}
            </div>
          </div>
          <div className="rounded-[24px] border border-[#E4EBF7] bg-white p-5">
            <div className="text-sm text-slate-500">Total Team</div>
            <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ledger-ink">
              {store.teamMembers.length}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[24px] border border-[#E4EBF7] bg-white p-5 shadow-ledger-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-bold tracking-[-0.03em] text-ledger-ink">
                Assigned People
              </h2>
              <Badge tone="Approved">On project</Badge>
            </div>
            <div className="space-y-3">
              {assignedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-[18px] border border-[#E4EBF7] bg-[#FBFCFE] px-4 py-3"
                >
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="flex items-center gap-3 text-left"
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold text-white"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-ledger-ink">
                        {member.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {member.role} · {member.email}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAssignmentToggle(member.id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Unassign
                  </button>
                </div>
              ))}
              {!assignedMembers.length ? (
                <div className="rounded-[18px] bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No one is assigned yet.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#E4EBF7] bg-white p-5 shadow-ledger-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-bold tracking-[-0.03em] text-ledger-ink">
                Available People
              </h2>
              <Badge tone="Draft">Ready to assign</Badge>
            </div>
            <div className="space-y-3">
              {availableMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-[18px] border border-[#E4EBF7] bg-[#FBFCFE] px-4 py-3"
                >
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="flex items-center gap-3 text-left"
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold text-white"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-ledger-ink">
                        {member.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {member.role} · {member.email}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAssignmentToggle(member.id)}
                    className="rounded-full border border-ledger-blue/20 bg-[#EEF4FF] px-3 py-2 text-sm font-semibold text-ledger-blue transition hover:bg-[#DDE8FF]"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          </section>
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
              Unassigning them may leave work without a clear owner.
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
    </AppShell>
  );
}
