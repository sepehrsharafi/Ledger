"use client";

import { useState } from "react";
import Badge from "@/components/Badge";
import Drawer from "@/components/Drawer";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { cn, formatDate } from "@/lib/utils";
import { panelClassName } from "@/components/project-modules/shared";

function ApprovalPreview({ type = "Creative" }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-[18px] border border-[#E4EBF7] bg-[#FCFDFF] text-[#C0CDE3]">
      <div className="flex h-24 w-24 items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="h-20 w-20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          {type === "Video" ? (
            <>
              <rect x="4" y="6" width="16" height="12" rx="2.5" />
              <path d="m10 10 5 2-5 2Z" fill="currentColor" stroke="none" />
            </>
          ) : type === "Copy" ? (
            <>
              <path d="M7 6.5h10M7 10.5h10M7 14.5h6" strokeLinecap="round" />
              <rect x="5" y="4.5" width="14" height="15" rx="2.5" />
            </>
          ) : (
            <>
              <rect x="5" y="5" width="14" height="14" rx="3" />
              <circle cx="10" cy="10" r="1.6" fill="currentColor" stroke="none" />
              <path d="m7.5 16 3.2-3.2 2.1 2.1 3.7-4.1" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

export default function ApprovalWorkbench({
  bundle,
  onStatusChange,
  onComment,
  onCreateApproval,
  onDeleteApproval,
  store,
}) {
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [activeCommentId, setActiveCommentId] = useState("");
  const [draft, setDraft] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [approvalDraft, setApprovalDraft] = useState({
    title: "",
    requestType: "Creative",
    submittedBy: store.teamMembers[0]?.name || "Alex Morgan",
    summary: "",
    details: "",
    pros: "",
    cons: "",
    recommendation: "",
    status: "Pending",
    thumbnailColor: "#CBD5E1",
    attachments: "Brief, mockup, and context note",
  });

  const resetComposer = () =>
    setApprovalDraft({
      title: "",
      requestType: "Creative",
      submittedBy: store.teamMembers[0]?.name || "Alex Morgan",
      summary: "",
      details: "",
      pros: "",
      cons: "",
      recommendation: "",
      status: "Pending",
      thumbnailColor: "#CBD5E1",
      attachments: "Brief, mockup, and context note",
    });

  async function handleCommentSave(approvalId) {
    if (!draft.trim() || isSavingComment) {
      return;
    }
    setIsSavingComment(true);
    try {
      await onComment(approvalId, draft);
      setDraft("");
      setActiveCommentId("");
    } finally {
      setIsSavingComment(false);
    }
  }

  if (!bundle.approvals.length) {
    return (
      <>
        <EmptyState
          title="No assets waiting for review."
          description="When new local review items exist for this project, they will appear here."
          action={
            <button
              onClick={() => setComposerOpen(true)}
              className="ledger-button ledger-button-primary mt-6 px-4"
            >
              Request Approval
            </button>
          }
        />
        <Drawer
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          title="Request Approval"
        >
          <div className="grid gap-4 sm:grid-cols-2" />
        </Drawer>
      </>
    );
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setComposerOpen(true)}
          className="ledger-button ledger-button-primary w-full sm:w-auto"
        >
          Request Approval
        </button>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        {bundle.approvals.map((approval) => (
          <button
            key={approval.id}
            onClick={() => setSelectedApproval({ ...approval })}
            className={cn(
              panelClassName,
              "p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(15,23,42,0.08)]",
            )}
          >
            <ApprovalPreview type={approval.requestType || approval.type} />
            <div className="mt-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold tracking-[-0.02em] text-ledger-ink">
                  {approval.title}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {approval.submittedBy} · {formatDate(approval.submittedDate)}
                </div>
              </div>
              <Badge tone={approval.status}>{approval.status}</Badge>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge tone={approval.type}>{approval.type}</Badge>
              {approval.requestType ? <Badge>{approval.requestType}</Badge> : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              {approval.summary || approval.details || "Open to review the full request details."}
            </p>
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(selectedApproval)}
        onClose={() => setSelectedApproval(null)}
        title={selectedApproval?.title || "Approval"}
      >
        {selectedApproval ? (
          <div className="space-y-5">
            <ApprovalPreview type={selectedApproval.requestType || selectedApproval.type} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-[#8FA0BE]">
                  Approval request
                </div>
                <div className="mt-2 text-2xl font-bold tracking-[-0.03em] text-ledger-ink">
                  {selectedApproval.title}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {selectedApproval.submittedBy} · {formatDate(selectedApproval.submittedDate)}
                </div>
              </div>
              <Badge tone={selectedApproval.status}>{selectedApproval.status}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Type", selectedApproval.type],
                ["Requested by", selectedApproval.submittedBy],
                ["Request focus", selectedApproval.requestType || "General"],
                ["Attachments", selectedApproval.attachments || "None"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[16px] bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    {label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-ledger-ink">{value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-[18px] border border-ledger-border p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Summary
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedApproval.summary || selectedApproval.details}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[18px] border border-ledger-border p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8FA0BE]">
                  Pros
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {selectedApproval.pros || "Not specified."}
                </p>
              </div>
              <div className="rounded-[18px] border border-ledger-border p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8FA0BE]">
                  Cons
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {selectedApproval.cons || "Not specified."}
                </p>
              </div>
            </div>
            <div className="rounded-[18px] border border-ledger-border p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Recommendation
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedApproval.recommendation || "No recommendation added yet."}
              </p>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Decision
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Approved", "Pending", "Rejected"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      onStatusChange(selectedApproval.id, item);
                      setSelectedApproval((current) =>
                        current ? { ...current, status: item } : current,
                      );
                    }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      selectedApproval.status === item
                        ? "border-ledger-blue bg-[#EEF4FF] text-ledger-blue"
                        : "border-[#E3EBF7] bg-white text-slate-500 hover:border-[#C9D8F2]",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#8FA0BE]">
                Review comments
              </div>
              <div className="mt-4 space-y-3">
                {selectedApproval.comments.map((comment) => (
                  <div key={comment.id} className="rounded-[16px] bg-slate-50 p-3">
                    <div className="text-sm font-medium text-ledger-ink">{comment.author}</div>
                    <div className="mt-1 text-sm text-slate-500">{comment.message}</div>
                  </div>
                ))}
              </div>
              <textarea
                value={activeCommentId === selectedApproval.id ? draft : ""}
                onFocus={() => setActiveCommentId(selectedApproval.id)}
                onChange={(event) => {
                  setActiveCommentId(selectedApproval.id);
                  setDraft(event.target.value);
                }}
                rows={3}
                placeholder="Add a comment..."
                className="ledger-textarea mt-4"
                disabled={isSavingComment}
              />
              <button
                onClick={() => handleCommentSave(selectedApproval.id)}
                disabled={!draft.trim() || isSavingComment}
                className="ledger-button ledger-button-primary mt-3 h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingComment ? "Saving..." : "Add Comment"}
              </button>
            </div>
            <div className="flex justify-end border-t border-[#E6EDF8] pt-4">
              <button
                onClick={async () => {
                  await onDeleteApproval(selectedApproval.id);
                  setSelectedApproval(null);
                }}
                className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete Request
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Drawer
        open={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          resetComposer();
        }}
        title="Request Approval"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Title</span>
            <input
              value={approvalDraft.title}
              onChange={(event) =>
                setApprovalDraft((current) => ({ ...current, title: event.target.value }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Type</span>
            <select
              value={approvalDraft.requestType}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  requestType: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {["Creative", "Copy", "Budget", "Strategy", "Video"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Submitted by</span>
            <select
              value={approvalDraft.submittedBy}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  submittedBy: event.target.value,
                }))
              }
              className="ledger-select"
            >
              {store.teamMembers.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Summary</span>
            <textarea
              value={approvalDraft.summary}
              onChange={(event) =>
                setApprovalDraft((current) => ({ ...current, summary: event.target.value }))
              }
              rows={3}
              className="ledger-textarea"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Details</span>
            <textarea
              value={approvalDraft.details}
              onChange={(event) =>
                setApprovalDraft((current) => ({ ...current, details: event.target.value }))
              }
              rows={5}
              className="ledger-textarea"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Pros</span>
            <input
              value={approvalDraft.pros}
              onChange={(event) =>
                setApprovalDraft((current) => ({ ...current, pros: event.target.value }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink">
            <span className="mb-2 block">Cons</span>
            <input
              value={approvalDraft.cons}
              onChange={(event) =>
                setApprovalDraft((current) => ({ ...current, cons: event.target.value }))
              }
              className="ledger-input"
            />
          </label>
          <label className="text-sm font-medium text-ledger-ink sm:col-span-2">
            <span className="mb-2 block">Recommendation</span>
            <textarea
              value={approvalDraft.recommendation}
              onChange={(event) =>
                setApprovalDraft((current) => ({
                  ...current,
                  recommendation: event.target.value,
                }))
              }
              rows={3}
              className="ledger-textarea"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => {
              if (!approvalDraft.title.trim() || !approvalDraft.details.trim()) {
                return;
              }
              onCreateApproval(bundle.project.id, approvalDraft);
              setComposerOpen(false);
              resetComposer();
            }}
            className="ledger-button ledger-button-primary min-w-[160px]"
          >
            Save Request
          </button>
        </div>
      </Drawer>
    </>
  );
}
