"use client";

export default function Drawer({ open, onClose, title, children }) {
  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/20 transition ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`ledger-scrollbar absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col overflow-y-auto border-l border-[#E4EBF7] bg-white px-6 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.14)] transition duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[22px] font-bold tracking-[-0.03em] text-ledger-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-[12px] p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5 fill-none stroke-current stroke-2"
            >
              <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
