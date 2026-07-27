"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Drawer({ open, onClose, title, eyebrow, children }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && open) {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink/20 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col border-l border-line bg-white transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-none items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <div className="label">{eyebrow || "Detail"}</div>
          <button type="button" onClick={onClose} className="btn btn-ghost h-[26px] px-2.5">
            Close
          </button>
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {title ? <h2 className="display mb-5 text-[24px] text-ink">{title}</h2> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
