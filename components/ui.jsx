"use client";

import { cn } from "@/lib/utils";
import { AVATAR_FILL } from "@/lib/palette";

/* ---------------------------------------------------------------------------
   The whole interface is built from these ten or so primitives. Screens should
   compose them instead of re-declaring borders, rules, pills and label type —
   that is what keeps each screen file short and the styling consistent.
   --------------------------------------------------------------------------- */

const CORNERS = [
  "-top-[3.5px] -left-[3.5px]",
  "-top-[3.5px] -right-[3.5px]",
  "-bottom-[3.5px] -left-[3.5px]",
  "-bottom-[3.5px] -right-[3.5px]",
];

/**
 * A hairline-bordered region. `marks` adds the small crosshairs that sit on the
 * four corners of the app's most important panels.
 */
export function Frame({ marks = false, className = "", children, ...rest }) {
  return (
    <div className={cn("relative border border-line bg-white", className)} {...rest}>
      {marks
        ? CORNERS.map((position) => (
            <span
              key={position}
              aria-hidden
              className={cn("pointer-events-none absolute z-10", position)}
            >
              <svg viewBox="0 0 8 8" className="h-[7px] w-[7px] text-faint">
                <path d="M4 0v8M0 4h8" stroke="currentColor" strokeWidth="1" />
              </svg>
            </span>
          ))
        : null}
      {children}
    </div>
  );
}

/** Uppercase label sitting on the app's signature dark rule. */
export function SectionHead({ title, action, className = "" }) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4 border-b border-edge pb-2",
        className,
      )}
    >
      <h2 className="label label-ink font-semibold">{title}</h2>
      {action ? <div className="flex items-center gap-3">{action}</div> : null}
    </div>
  );
}

export function Section({ title, action, className = "", bodyClassName = "", children }) {
  return (
    <section className={cn("min-w-0", className)}>
      <SectionHead title={title} action={action} />
      <div className={cn("pt-1", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Quiet uppercase link used for the "ALL" / "BOARD" affordances. */
export function MetaLink({ children, className = "", ...rest }) {
  return (
    <a
      className={cn("label transition-colors hover:text-ink", className)}
      {...rest}
    >
      {children}
    </a>
  );
}

/* --- Numbers -------------------------------------------------------------- */

/** Signed change indicator: solid triangle plus the magnitude. */
export function Delta({ value, className = "" }) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }

  const positive = Number(value) >= 0;

  return (
    <span
      className={cn(
        "num inline-flex items-baseline gap-1 text-[11px] font-medium",
        positive ? "text-pos" : "text-neg",
        className,
      )}
    >
      <span aria-hidden className="text-[8px]">
        {positive ? "▲" : "▼"}
      </span>
      {Math.abs(Number(value)).toFixed(1)}%
    </span>
  );
}

/** Dependency-free sparkline — a plain polyline scaled to the given box. */
export function Sparkline({
  data = [],
  className = "",
  stroke = "var(--color-accent)",
  height = 34,
}) {
  const points = data.map(Number).filter((value) => !Number.isNaN(value));

  if (points.length < 2) {
    return <div style={{ height }} className={className} />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - ((value - min) / span) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ height }}
      className={cn("w-full", className)}
      aria-hidden
    >
      <polyline
        points={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The metric row that opens most screens: one hairline frame, cells divided by
 * vertical rules, wrapping to two columns and then one as the screen narrows.
 */
export function StatStrip({ items = [], marks = false, className = "" }) {
  return (
    <Frame
      marks={marks}
      className={cn("grid-hairline grid-cells", className)}
      style={{ "--cols": items.length }}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0 px-4 py-4 sm:px-5">
          <div className="label">{item.label}</div>
          <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
            <span className="display text-[26px] text-ink">{item.value}</span>
            {item.change === undefined ? null : <Delta value={item.change} />}
          </div>
          {item.spark ? (
            <Sparkline data={item.spark} className="mt-3" height={30} />
          ) : null}
          {item.note ? (
            <div className="mt-2.5 text-[11.5px] text-muted">{item.note}</div>
          ) : null}
        </div>
      ))}
    </Frame>
  );
}

/* --- Status ---------------------------------------------------------------- */

const PILL_TONES = {
  accent: "border-accent/40 text-accent",
  positive: "border-pos/40 text-pos",
  negative: "border-neg/40 text-neg",
  warn: "border-warn/40 text-warn",
  neutral: "border-line text-muted",
  ink: "border-edge text-ink",
};

const TONE_BY_STATUS = {
  Active: "accent",
  New: "accent",
  Scheduled: "neutral",
  Ended: "neutral",
  Draft: "neutral",
  Lost: "neutral",
  Low: "neutral",
  Member: "neutral",
  Pending: "warn",
  Medium: "warn",
  Manager: "accent",
  Admin: "ink",
  Contacted: "accent",
  Qualified: "accent",
  Won: "positive",
  Approved: "positive",
  Published: "positive",
  Rejected: "negative",
  High: "negative",
};

/** Square outline status chip. `tone` may be a tone key or a domain status. */
export function Pill({ tone = "neutral", children, className = "" }) {
  const resolved = PILL_TONES[tone] || PILL_TONES[TONE_BY_STATUS[tone]] || PILL_TONES.neutral;

  return (
    <span
      className={cn(
        "label inline-flex h-[19px] items-center border px-1.5 leading-none",
        resolved,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name = "", color, variant = "solid", className = "" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "num flex shrink-0 items-center justify-center text-[9px] font-medium leading-none",
        variant === "solid"
          ? "text-white"
          : "border border-line bg-white text-ink-soft",
        className || "h-6 w-6",
      )}
      style={variant === "solid" ? { backgroundColor: color || AVATAR_FILL } : undefined}
      title={name || undefined}
    >
      {initials || "—"}
    </span>
  );
}

/* --- Controls -------------------------------------------------------------- */

/**
 * A person picker limited to the project's roster.
 *
 * `current` is kept as an option even when that person is no longer on the
 * project — an existing record must never be silently reassigned just because
 * someone was unassigned after it was created. Such a name is marked so the
 * stale value is visible rather than looking like a normal choice.
 */
export function AssigneeSelect({ value, onChange, members = [], ...rest }) {
  const names = members.map((member) => member.name);
  const isStale = value && !names.includes(value);

  return (
    <select
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className="field"
      {...rest}
    >
      {names.length === 0 && !isStale ? (
        <option value="">No one assigned to this project</option>
      ) : null}
      {isStale ? <option value={value}>{value} — no longer on project</option> : null}
      {names.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}

/**
 * Segmented switch: the active option is filled ink, the rest stay plain.
 *
 * `w-fit` is load-bearing. CSS blockifies `inline-flex` on a flex item, so inside
 * a `flex-col` parent this control would stretch to the full row width and its
 * border would run far past the buttons. An explicit cross-size defeats the
 * default `align-items: stretch`; `self-start` would fix the width too but would
 * also drag it out of vertical centre in the row layouts that use it.
 */
export function Segmented({ options = [], value, onChange, className = "" }) {
  return (
    <div className={cn("inline-flex w-fit border border-line", className)}>
      {options.map((option) => {
        const key = option.value ?? option;
        const active = key === value;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={cn(
              "label px-3 py-[7px] transition-colors",
              active ? "bg-edge text-white" : "hover:text-ink",
            )}
          >
            {option.label ?? option}
          </button>
        );
      })}
    </div>
  );
}

/** Filter chip row — used for statuses, channels, owners and assignees. */
/**
 * A one-line progress mark. Sized in `em` so it matches whatever text it sits
 * beside, and `currentColor` so it works on both the light and filled variants of
 * a control without being told which it is on.
 */
export function Spinner({ className = "" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("h-[1em] w-[1em] shrink-0 animate-spin", className)}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Chip({ active, busy = false, children, className = "", ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={Boolean(active)}
      aria-busy={busy || undefined}
      className={cn(
        "label inline-flex h-[26px] items-center gap-1.5 border px-2 transition-colors",
        active
          ? "border-accent bg-accent text-white"
          : "border-line bg-white hover:border-ink hover:text-ink",
        // Dim the controls that are not the one being waited on, so the pending
        // chip stays the only thing drawing the eye.
        "disabled:cursor-default disabled:opacity-45 aria-busy:opacity-100",
        className,
      )}
      {...rest}
    >
      {busy ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function IconButton({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-[34px] w-[34px] items-center justify-center border border-line bg-white text-ink-soft transition-colors hover:border-ink hover:text-ink",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Labelled form control wrapper so composers stay declarative. */
export function Field({ label, hint, className = "", children }) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="label block pb-1.5">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11.5px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[18px] w-[34px] border transition-colors",
        checked ? "border-accent bg-accent" : "border-line bg-white",
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] block h-[12px] w-[12px] transition-all",
          checked ? "left-[18px] bg-white" : "left-[2px] bg-faint",
        )}
      />
    </button>
  );
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={Boolean(checked)}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex h-[15px] w-[15px] shrink-0 items-center justify-center border transition-colors",
        checked ? "border-accent bg-accent text-white" : "border-line bg-white",
      )}
    >
      {checked ? (
        <svg viewBox="0 0 12 12" className="h-[9px] w-[9px]" fill="none">
          <path
            d="m2 6.2 2.6 2.6L10 3.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
      ) : null}
    </button>
  );
}

/* --- Data ----------------------------------------------------------------- */

/** Thin progress rail. `tone` accepts any CSS colour. */
export function Meter({ value = 0, tone = "var(--color-accent)", className = "" }) {
  return (
    <div className={cn("h-[3px] w-full bg-line-soft", className)}>
      <div
        className="h-full"
        style={{
          width: `${Math.max(0, Math.min(100, Number(value) || 0))}%`,
          backgroundColor: tone,
        }}
      />
    </div>
  );
}

/**
 * Hairline table. `columns` describe the head; `align: "right"` and a `width`
 * are the only per-column knobs any screen has needed.
 */
export function Table({ columns = [], children, className = "" }) {
  return (
    <div className={cn("thin-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0", className)}>
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr className="border-b border-edge">
            {columns.map((column) => (
              <th
                key={column.key ?? column.label}
                style={column.width ? { width: column.width } : undefined}
                className={cn(
                  "label pb-2 pr-4 font-medium last:pr-0",
                  column.align === "right" ? "text-right" : "",
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children, onClick, className = "" }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-line-soft align-middle",
        onClick ? "cursor-pointer transition-colors hover:bg-shade" : "",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function Cell({ align, children, className = "" }) {
  return (
    <td
      className={cn(
        "py-3 pr-4 text-[13px] text-ink-soft last:pr-0",
        align === "right" ? "text-right" : "",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** Label / value pair used across detail panes and settings. */
export function KeyValue({ label, children, className = "" }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-2", className)}>
      <span className="label">{label}</span>
      <span className="min-w-0 text-right text-[13px] text-ink">{children}</span>
    </div>
  );
}
