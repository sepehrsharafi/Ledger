"use client";

import { useState } from "react";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { Avatar, Chip, Frame, Pill, Section } from "@/components/ui";
import ApprovalComposer from "@/components/project-modules/ApprovalComposer";
import { usePageAction } from "@/context/PageAction";
import { formatDate } from "@/lib/utils";

const DECISIONS = ["Approved", "Pending", "Rejected"];

/** Placeholder for the asset itself — the demo has no uploaded media. */
function AssetPreview({ className = "h-[190px]" }) {
  return (
    <div className={`flex items-center justify-center bg-shade text-faint ${className}`}>
      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-[1.2]">
        <rect x="3.5" y="5.5" width="17" height="13" />
        <circle cx="9" cy="10" r="1.4" />
        <path d="m5.5 17 4.5-4.5 3 3 3.5-4 2 2.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function approvalMeta(approval) {
  return [
    approval.submittedBy,
    formatDate(approval.submittedDate),
    [approval.type, approval.requestType].filter(Boolean).join(" / "),
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function ApprovalWorkbench({
  bundle,
  onStatusChange,
  onComment,
  onCreateApproval,
  onDeleteApproval,
  store,
}) {
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  usePageAction(() => setComposerOpen(true));

  const approvals = bundle.approvals || [];

  function setDecision(approval, status) {
    onStatusChange(approval.id, status);
    setSelected((current) => (current ? { ...current, status } : current));
  }

  async function saveComment() {
    if (!comment.trim() || isSavingComment) {
      return;
    }

    setIsSavingComment(true);
    try {
      await onComment(selected.id, comment);
      setComment("");
    } finally {
      setIsSavingComment(false);
    }
  }

  const composer = (
    <ApprovalComposer
      open={composerOpen}
      onClose={() => setComposerOpen(false)}
      onCreate={onCreateApproval}
      projectId={bundle.project.id}
      teamMembers={store.teamMembers}
    />
  );

  if (!approvals.length) {
    return (
      <>
        <EmptyState
          title="No assets waiting for review."
          description="Review requests for this project will appear here."
          action={
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="btn btn-primary"
            >
              Request approval
            </button>
          }
        />
        {composer}
      </>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {approvals.map((approval) => (
          <Frame key={approval.id} marks className="flex flex-col">
            <AssetPreview />
            <div className="flex flex-1 flex-col border-t border-line p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="display min-w-0 text-[18px] text-ink">{approval.title}</h2>
                <Pill tone={approval.status}>{approval.status}</Pill>
              </div>
              <div className="label mt-2">{approvalMeta(approval)}</div>
              <p className="mt-3.5 text-[12.5px] leading-5 text-muted">
                {approval.summary || approval.details}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDecision(approval, "Approved")}
                  className="btn btn-primary"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setSelected({ ...approval })}
                  className="btn btn-ghost"
                >
                  Request changes
                </button>
              </div>
            </div>
          </Frame>
        ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        eyebrow="Approval request"
        title={selected?.title || "Approval"}
      >
        {selected ? (
          <div className="space-y-7">
            <div className="-mt-2 flex items-start justify-between gap-4">
              <div className="label">{approvalMeta(selected)}</div>
              <Pill tone={selected.status}>{selected.status}</Pill>
            </div>

            <AssetPreview className="h-[220px] border border-line" />

            <p className="text-[13.5px] leading-6 text-ink-soft">
              {selected.details || selected.summary}
            </p>

            <div className="grid gap-7 sm:grid-cols-2">
              <Section title="For" bodyClassName="pt-3">
                <p className="text-[12.5px] leading-5 text-muted">
                  {selected.pros || "Not specified."}
                </p>
              </Section>
              <Section title="Against" bodyClassName="pt-3">
                <p className="text-[12.5px] leading-5 text-muted">
                  {selected.cons || "Not specified."}
                </p>
              </Section>
            </div>

            <Section title="Recommendation" bodyClassName="pt-3">
              <p className="text-[12.5px] leading-5 text-muted">
                {selected.recommendation || "No recommendation added yet."}
              </p>
            </Section>

            <Section title="Attachments" bodyClassName="pt-3">
              <p className="text-[12.5px] text-accent">{selected.attachments || "None"}</p>
            </Section>

            <Section title="Decision" bodyClassName="pt-3">
              <div className="flex flex-wrap gap-1.5">
                {DECISIONS.map((item) => (
                  <Chip
                    key={item}
                    active={selected.status === item}
                    onClick={() => setDecision(selected, item)}
                  >
                    {item}
                  </Chip>
                ))}
              </div>
            </Section>

            <Section title="Comments">
              {(selected.comments || []).map((entry) => (
                <div key={entry.id} className="flex gap-3 border-b border-line-soft py-3">
                  <Avatar
                    name={entry.author}
                    color={
                      store.teamMembers.find((member) => member.name === entry.author)
                        ?.avatarColor
                    }
                    className="mt-px h-[22px] w-[22px]"
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-ink">{entry.author}</div>
                    <p className="mt-1 text-[12.5px] leading-5 text-muted">
                      {entry.message}
                    </p>
                  </div>
                </div>
              ))}
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                placeholder="Add a comment…"
                className="field-area mt-4"
                disabled={isSavingComment}
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={saveComment}
                  disabled={!comment.trim() || isSavingComment}
                  className="btn btn-primary"
                >
                  {isSavingComment ? "Saving…" : "Add comment"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await onDeleteApproval(selected.id);
                    setSelected(null);
                  }}
                  className="btn btn-danger"
                >
                  Delete request
                </button>
              </div>
            </Section>
          </div>
        ) : null}
      </Modal>

      {composer}
    </>
  );
}
