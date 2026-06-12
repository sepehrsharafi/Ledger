"use client";

import { useEffect, useState } from "react";

export default function Modal({ open, onClose, title, children, footer }) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }

    const timeout = setTimeout(() => setMounted(false), 180);
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && open) {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition duration-200 ${
        open
          ? "bg-slate-950/35 backdrop-blur-sm"
          : "pointer-events-none bg-slate-950/0 backdrop-blur-[0px]"
      }`}
    >
      <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
        <div
          className={`ledger-scrollbar flex w-full max-w-7xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[24px] border border-[#E4EBF7] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] transition duration-200 ease-out ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-2 scale-[0.985] opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#E4EBF7] px-6 py-5">
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
          <div className="ledger-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {children}
          </div>
          {footer ? (
            <div className="flex flex-none justify-end gap-3 border-t border-[#E4EBF7] px-6 py-5">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
