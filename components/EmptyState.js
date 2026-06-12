export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-ledger-border bg-white px-6 py-12 text-center shadow-ledger-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ledger-mist text-ledger-blue">
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-[1.75]">
          <path d="M7 6.5h10M7 12h10M7 17.5h6" strokeLinecap="round" />
          <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-ledger-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action}
    </div>
  );
}
