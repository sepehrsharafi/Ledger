"use client";

import { useEffect, useMemo, useState } from "react";
import Drawer from "@/components/Drawer";
import Modal from "@/components/Modal";
import { Avatar, KeyValue, Pill, Section, StatStrip } from "@/components/ui";
import { useTeamPageData } from "@/lib/useLedgerData";

function MemberRow({ member, onOpen, action }) {
  return (
    <div className="flex items-center gap-3 border-b border-line-soft py-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Avatar name={member.name} color={member.avatarColor} className="h-7 w-7" />
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-ink">
            {member.name}
          </span>
          <span className="mt-0.5 block truncate text-[11.5px] text-muted">
            {member.email}
          </span>
        </span>
      </button>
      <Pill tone={member.role}>{member.role}</Pill>
      {action}
    </div>
  );
}

export default function TeamPage() {
  const { store, toggleTeamMemberAssignment } = useTeamPageData();
  const [selectedMember, setSelectedMember] = useState(null);
  const [projectId, setProjectId] = useState("");
  const [pendingUnassign, setPendingUnassign] = useState(null);

  useEffect(() => {
    if (!projectId && store.projects[0]?.id) {
      setProjectId(store.projects[0].id);
    }
  }, [projectId, store.projects]);

  const project = useMemo(
    () => store.projects.find((item) => item.id === projectId),
    [projectId, store.projects],
  );

  const assigned = store.teamMembers.filter((member) =>
    member.assignedProjectIds.includes(projectId),
  );
  const available = store.teamMembers.filter(
    (member) => !member.assignedProjectIds.includes(projectId),
  );

  async function toggle(memberId, options = {}) {
    const result = await toggleTeamMemberAssignment(projectId, memberId, options);

    if (result?.status === "requires-confirmation") {
      setPendingUnassign(result);
    } else if (result?.status === "updated") {
      setPendingUnassign(null);
    }
  }

  return (
    <>
      <div className="space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-edge pb-2">
          <div className="min-w-0">
            <div className="label">Capacity view</div>
            <div className="display mt-2 text-[21px] text-ink">
              {project?.name || "Select a project"}
            </div>
          </div>
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            aria-label="Project"
            className="field w-[220px]"
          >
            {store.projects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <StatStrip
          items={[
            { label: "Assigned", value: assigned.length },
            { label: "Available", value: available.length },
            { label: "Agency total", value: store.teamMembers.length },
          ]}
        />

        <div className="grid gap-9 xl:grid-cols-2">
          <Section title="Assigned">
            {assigned.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                onOpen={() => setSelectedMember(member)}
                action={
                  <button
                    type="button"
                    onClick={() => toggle(member.id)}
                    className="btn btn-ghost h-[26px] px-2.5"
                  >
                    Unassign
                  </button>
                }
              />
            ))}
            {assigned.length ? null : (
              <p className="py-4 text-[13px] text-muted">No one is assigned yet.</p>
            )}
          </Section>

          <Section title="Available">
            {available.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                onOpen={() => setSelectedMember(member)}
                action={
                  <button
                    type="button"
                    onClick={() => toggle(member.id)}
                    className="btn btn-primary h-[26px] px-2.5"
                  >
                    Assign
                  </button>
                }
              />
            ))}
            {available.length ? null : (
              <p className="py-4 text-[13px] text-muted">
                Everyone is already on this project.
              </p>
            )}
          </Section>
        </div>
      </div>

      <Drawer
        open={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        eyebrow="Team member"
        title={selectedMember?.name || "Member"}
      >
        {selectedMember ? (
          <div className="space-y-8">
            <div className="border-y border-line">
              <KeyValue label="Email">{selectedMember.email}</KeyValue>
              <KeyValue label="Role">{selectedMember.role}</KeyValue>
              <KeyValue label="Assignments">
                {selectedMember.assignedProjectIds.length}
              </KeyValue>
            </div>

            <Section title="Assigned projects">
              {selectedMember.assignedProjectIds.map((id) => {
                const item = store.projects.find((entry) => entry.id === id);

                return (
                  <div key={id} className="border-b border-line-soft py-3">
                    <div className="text-[13px] font-semibold text-ink">{item?.name}</div>
                    <div className="label mt-1">{item?.clientName}</div>
                  </div>
                );
              })}
              {selectedMember.assignedProjectIds.length ? null : (
                <p className="py-4 text-[13px] text-muted">No project assignments.</p>
              )}
            </Section>
          </div>
        ) : null}
      </Drawer>

      <Modal
        open={Boolean(pendingUnassign)}
        onClose={() => setPendingUnassign(null)}
        eyebrow="Confirm unassign"
        title="Unassign team member?"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPendingUnassign(null)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => toggle(pendingUnassign.member.id, { force: true })}
              className="btn btn-danger"
            >
              Unassign anyway
            </button>
          </>
        }
      >
        {pendingUnassign ? (
          <div className="space-y-6">
            <p className="text-[13.5px] leading-6 text-ink-soft">
              {pendingUnassign.member.name} still has {pendingUnassign.taskCount} task
              {pendingUnassign.taskCount === 1 ? "" : "s"} assigned in this project.
              Unassigning them may leave work without a clear owner.
            </p>
            <Section title="Assigned tasks">
              {pendingUnassign.assignedTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="border-b border-line-soft py-2.5 text-[13px] text-ink"
                >
                  {task.title}
                </div>
              ))}
            </Section>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
