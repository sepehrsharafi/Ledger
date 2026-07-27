import { cn } from "@/lib/utils";

export default function Logo({ compact = false, showTagline = false, className = "" }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 24 24" className="h-[19px] w-[19px] shrink-0 fill-ink" aria-hidden>
        <path d="M12 2 22 7l-10 5L2 7l10-5Z" />
        <path d="M12 14.4 3.6 10.2 2 11l10 5 10-5-1.6-.8L12 14.4Z" />
        <path d="M12 18.4 3.6 14.2 2 15l10 5 10-5-1.6-.8L12 18.4Z" />
      </svg>
      {compact ? null : (
        <div className="min-w-0">
          <div className="text-[15px] font-bold uppercase leading-none tracking-[0.22em] text-ink">
            Ledger
          </div>
          {showTagline ? (
            <div className="label mt-2">Every client, on the record.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
