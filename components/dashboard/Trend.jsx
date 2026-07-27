"use client";

import { cn } from "@/lib/utils";
import { SERIES } from "@/lib/palette";

/* ---------------------------------------------------------------------------
   The overview's two chart shapes, drawn as plain SVG. A charting library buys
   nothing here — there are no tooltips or interactions in this layout — and this
   keeps the route's bundle to the markup it actually needs.
   --------------------------------------------------------------------------- */

function toPoints(values, { min, max }) {
  const span = max - min || 1;

  return values.map((value, index) => [
    values.length > 1 ? (index / (values.length - 1)) * 100 : 0,
    100 - ((value - min) / span) * 100,
  ]);
}

function polyline(points) {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

/** One filled trend band — the "separate" view of a single metric. */
export function TrendArea({ values = [], color = SERIES.mid, height = 62, fill }) {
  if (values.length < 2) {
    return <div style={{ height }} />;
  }

  const bounds = { min: Math.min(...values), max: Math.max(...values) };
  const points = toPoints(values, bounds);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ height }}
      className="w-full"
      aria-hidden
    >
      <polygon points={`0,100 ${polyline(points)} 100,100`} fill={fill || `${color}1f`} />
      <polyline
        points={polyline(points)}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * All metrics on one shared scale — the "indexed" view. Every series is already
 * rebased by the caller, so they can be plotted against common bounds.
 */
export function TrendLines({ series = [], height = 220 }) {
  const all = series.flatMap((item) => item.values);

  if (all.length < 2) {
    return <div style={{ height }} />;
  }

  const bounds = { min: Math.min(...all), max: Math.max(...all) };

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ height }}
      className="w-full"
      aria-hidden
    >
      {[0, 25, 50, 75, 100].map((y) => (
        <line
          key={y}
          x1="0"
          x2="100"
          y1={y}
          y2={y}
          stroke="var(--color-line-soft)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {series.map((item) => (
        <polyline
          key={item.key}
          points={polyline(toPoints(item.values, bounds))}
          fill="none"
          stroke={item.color}
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/** Month ticks, spaced to line up with the charts above them. */
export function MonthAxis({ months = [], className = "" }) {
  return (
    <div className={cn("label flex justify-between pt-2", className)}>
      {months.map((month) => (
        <span key={month}>{month}</span>
      ))}
    </div>
  );
}

/** Small colour key shared by the indexed chart and the channel breakdown. */
export function LegendDot({ color, children }) {
  return (
    <span className="label inline-flex items-center gap-1.5">
      <span className="h-[7px] w-[7px] shrink-0" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}
