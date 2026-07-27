import { cn } from "@/lib/utils";

export function SkeletonBlock({ className = "" }) {
  return <div className={cn("animate-pulse bg-line-soft", className)} />;
}

/** Placeholder for the hairline metric strip that opens most screens. */
export function StripSkeleton({ cells = 4 }) {
  return (
    <div className="grid-hairline grid-cells border border-line" style={{ "--cols": cells }}>
      {Array.from({ length: cells }).map((_, index) => (
        <div key={index} className="px-4 py-4 sm:px-5">
          <SkeletonBlock className="h-[9px] w-20" />
          <SkeletonBlock className="mt-3 h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div>
      <div className="border-b border-edge pb-2">
        <SkeletonBlock className="h-[9px] w-28" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="border-b border-line-soft py-3.5">
          <SkeletonBlock className="h-3 w-[38%]" />
          <SkeletonBlock className="mt-2 h-[9px] w-[22%]" />
        </div>
      ))}
    </div>
  );
}

export function BoardSkeleton({ columns = 4, cards = 3 }) {
  return (
    <div className="grid-hairline grid-cells border border-line" style={{ "--cols": columns }}>
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="p-4">
          <SkeletonBlock className="h-[9px] w-24" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: cards }).map((__, cardIndex) => (
              <SkeletonBlock key={cardIndex} className="h-[86px] w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PanelsSkeleton({ panels = 2, rows = 4 }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: panels }).map((_, index) => (
        <div key={index}>
          <div className="border-b border-edge pb-2">
            <SkeletonBlock className="h-[9px] w-32" />
          </div>
          {Array.from({ length: rows }).map((__, rowIndex) => (
            <div key={rowIndex} className="border-b border-line-soft py-4">
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3, columns = "md:grid-cols-2 xl:grid-cols-3" }) {
  return (
    <div className={cn("grid gap-6", columns)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border border-line">
          <SkeletonBlock className="h-[3px] w-full" />
          <div className="p-5">
            <SkeletonBlock className="h-5 w-2/3" />
            <SkeletonBlock className="mt-2.5 h-[9px] w-1/3" />
            <SkeletonBlock className="mt-6 h-[72px] w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Default module shape: metric strip plus a table. */
export function ModuleSkeleton({ cards = 4, rows = 6, board = false }) {
  return (
    <div className="space-y-8">
      {cards > 0 ? <StripSkeleton cells={cards} /> : null}
      {board ? <BoardSkeleton /> : <TableSkeleton rows={rows} />}
    </div>
  );
}
