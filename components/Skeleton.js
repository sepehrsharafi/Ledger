export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;
}

export function ModuleSkeleton({ cards = 4, rows = 5, board = false }) {
  return (
    <div className="space-y-6">
      {cards > 0 ? (
        <div className={`grid gap-4 ${cards > 2 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2"}`}>
          {Array.from({ length: cards }).map((_, index) => (
            <div key={index} className="rounded-[28px] border border-ledger-border bg-white p-5 shadow-ledger-sm">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="mt-4 h-10 w-20" />
              <SkeletonBlock className="mt-6 h-12 w-full" />
            </div>
          ))}
        </div>
      ) : null}
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

export function CardGridSkeleton({
  count = 6,
  columns = "lg:grid-cols-2 2xl:grid-cols-3",
}) {
  return (
    <div className={`grid gap-5 ${columns}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-[26px] border border-[#E4EBF7] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-12 w-12 rounded-[16px]" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((__, statIndex) => (
              <SkeletonBlock key={statIndex} className="h-[74px] w-full rounded-[18px]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PanelsSkeleton({ panels = 3, rows = 4 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: panels }).map((_, index) => (
        <div
          key={index}
          className="rounded-[22px] border border-[#E4EBF7] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
        >
          <SkeletonBlock className="h-5 w-40" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: rows }).map((__, rowIndex) => (
              <SkeletonBlock key={rowIndex} className="h-12 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
