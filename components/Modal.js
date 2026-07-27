"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Modal({ open, onClose, title, eyebrow, children, footer }) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return undefined;
    }

    const timeout = setTimeout(() => setMounted(false), 160);
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
      className={cn(
        "fixed inset-0 z-50 overflow-y-auto transition-opacity duration-150",
        open ? "bg-ink/25" : "pointer-events-none opacity-0",
      )}
    >
      <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
        <div
          className={cn(
            "flex max-h-[calc(100dvh-2rem)] w-full max-w-[760px] flex-col border border-line bg-white transition duration-150",
            open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          )}
        >
          <div className="flex flex-none items-center justify-between gap-4 border-b border-line px-5 py-3.5">
            <div className="label">{eyebrow || title}</div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost h-[26px] px-2.5"
            >
              Close
            </button>
          </div>
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {eyebrow ? (
              <h2 className="display mb-5 text-[24px] text-ink">{title}</h2>
            ) : null}
            {children}
          </div>
          {footer ? (
            <div className="flex flex-none flex-wrap justify-end gap-2.5 border-t border-line px-5 py-3.5">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
