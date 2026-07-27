import { Frame } from "@/components/ui";

export default function EmptyState({ title, description, action }) {
  return (
    <Frame marks className="flex min-h-[220px] flex-col items-center justify-center px-6 py-14 text-center">
      <div className="label">Nothing here yet</div>
      <h3 className="display mt-3 max-w-md text-[20px] text-ink">{title}</h3>
      {description ? (
        <p className="mt-2.5 max-w-md text-[13px] leading-6 text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </Frame>
  );
}
