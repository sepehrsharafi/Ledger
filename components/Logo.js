export default function Logo({ compact = false, showTagline = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-ledger-blue text-white shadow-[0_10px_24px_rgba(43,88,232,0.2)]">
        <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current">
          <path d="M5 9.5 16.3 4l10.7 5.5-10.7 5.4L5 9.5Zm3 6L19.3 10 27 14v4.8l-11 5.6L8 20v-4.5Zm0 7.3 8 4.2L27 21.3V26l-11 5.5L8 27.1v-4.3Z" />
        </svg>
      </div>
      {!compact && (
        <div>
          <div className="text-[22px] font-bold tracking-[-0.04em] text-ledger-blue">
            Ledger
          </div>
          {showTagline ? (
            <div className="-mt-0.5 text-sm text-slate-500">
              Every client, on the record.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
