import { cn } from "@/lib/utils";

const styles = {
  Active: "bg-blue-50 text-ledger-blue",
  Scheduled: "bg-amber-50 text-amber-700",
  Ended: "bg-slate-100 text-slate-600",
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
  New: "bg-sky-50 text-sky-700",
  Contacted: "bg-indigo-50 text-indigo-700",
  Qualified: "bg-violet-50 text-violet-700",
  Won: "bg-emerald-50 text-emerald-700",
  Lost: "bg-slate-100 text-slate-600",
  Admin: "bg-ledger-mist text-ledger-blue",
  Manager: "bg-cyan-50 text-cyan-700",
  Member: "bg-slate-100 text-slate-700",
  High: "bg-rose-50 text-rose-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
  Draft: "bg-slate-100 text-slate-600",
  Published: "bg-emerald-50 text-emerald-700",
};

export default function Badge({ children, tone }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", styles[tone] || "bg-slate-100 text-slate-600")}>
      {children}
    </span>
  );
}
