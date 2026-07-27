"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { Avatar, Pill, Section, StatStrip } from "@/components/ui";

function MemberRow({ member, action }) {
  return (
    <div className="flex items-center gap-3 border-b border-line-soft py-3">
      <Avatar name={member.name} color={member.avatarColor} className="h-7 w-7" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-ink">{member.name}</div>
        <div className="mt-0.5 truncate text-[11.5px] text-muted">{member.email}</div>
      </div>
      <Pill tone={member.role}>{member.role}</Pill>
      {action}
    </div>
  );
}

export default function ProjectTeamScreen({ bundle, store, onToggleAssignment }) {
  const [pendingUnassign, setPendingUnassign] = useState(null);

  const assigned = store.teamMembers.filter((member) =>
    member.assignedProjectIds.includes(bundle.project.id),
  );
  const available = store.teamMembers.filter(
    (member) => !member.assignedProjectIds.includes(bundle.project.id),
  );

  // Unassigning someone who still owns tasks needs an explicit confirmation.
  async function toggle(memberId, options = {}) {
    const result = await onToggleAssignment(memberId, options);

    if (result?.status === "requires-confirmation") {
      setPendingUnassign(result);
    } else if (result?.status === "updated") {
      setPendingUnassign(null);
    }
  }

  return (
    <div className="space-y-7">
      <StatStrip
        items={[
          { label: "On project", value: assigned.length },
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
            <p className="py-4 text-[13px] text-muted">
              No one is assigned to this project yet.
            </p>
          )}
        </Section>

        <Section title="Available">
          {available.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
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
              Every agency member is already on this project.
            </p>
          )}
        </Section>
      </div>

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
    </div>
  );
}
