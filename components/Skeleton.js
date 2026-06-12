export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;
}

export function ModuleSkeleton({ cards = 4, rows = 5, board = false }) {
  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${cards > 2 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2"}`}>
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="rounded-[28px] border border-ledger-border bg-white p-5 shadow-ledger-sm">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-4 h-10 w-20" />
            <SkeletonBlock className="mt-6 h-12 w-full" />
          </div>
        ))}
      </div>
      {board ? (
        <div className="grid gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[28px] border border-ledger-border bg-white p-4 shadow-ledger-sm">
              <SkeletonBlock className="mb-4 h-5 w-28" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((__, itemIndex) => (
                  <SkeletonBlock key={itemIndex} className="h-28 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-ledger-border bg-white p-5 shadow-ledger-sm">
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, index) => (
              <SkeletonBlock key={index} className="h-14 w-full" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
