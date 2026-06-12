"use client";

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[24px] border border-[#E4EBF7] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-bold tracking-[-0.03em] text-ledger-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-[12px] p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <span className="sr-only">Close</span>
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5 fill-none stroke-current stroke-2"
            >
              <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-6">{children}</div>
        {footer ? (
          <div className="mt-6 flex justify-end gap-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
