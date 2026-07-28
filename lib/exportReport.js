import { getKpiItems, getPipelineStages } from "@/components/dashboard/overviewMetrics";

/** Quotes a CSV field only when it has to be, and escapes embedded quotes. */
function cell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function section(title, rows) {
  return [[title], ...rows, [""]];
}

/**
 * Builds the overview as CSV from the same derived figures the dashboard renders,
 * so the file always agrees with what is on screen rather than recomputing them.
 */
export function buildOverviewCsv(bundle) {
  const project = bundle.project || {};

  const rows = [
    ...section("Project", [
      ["Name", project.name],
      ["Client", project.clientName],
      ["Type", project.type],
      ["Status", project.status],
    ]),
    ...section(
      "Headline metrics",
      [
        ["Metric", "Value", "Change %", "Note"],
        ...getKpiItems(bundle).map((item) => [
          item.label,
          item.value,
          Number.isFinite(item.change) ? item.change.toFixed(1) : "",
          item.note,
        ]),
      ],
    ),
    ...section(
      "Pipeline",
      [
        ["Stage", "Leads", "Share %"],
        ...getPipelineStages(bundle).map((stage) => [
          stage.label,
          stage.count,
          stage.share.toFixed(1),
        ]),
      ],
    ),
    ...section(
      "Campaigns",
      [
        ["Campaign", "Channel", "Status", "Budget", "Spent", "Conversions"],
        ...(bundle.campaigns || []).map((campaign) => [
          campaign.name,
          campaign.channel,
          campaign.status,
          campaign.budget,
          campaign.spent,
          campaign.conversions,
        ]),
      ],
    ),
    ...section(
      "Monthly series",
      [
        ["Month", "Traffic", "Leads", "Conversions", "Spend"],
        ...(bundle.series || []).map((point) => [
          point.month,
          point.traffic,
          point.leads,
          point.conversions,
          point.spend,
        ]),
      ],
    ),
  ];

  return rows.map((row) => row.map(cell).join(",")).join("\n");
}

export function overviewCsvFilename(bundle) {
  const slug = (bundle.project?.name || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const month = (bundle.series || []).at(-1)?.month?.slice(0, 7) || "export";
  return `${slug}-overview-${month}.csv`;
}

/** Triggers the download client-side — no server round trip, no dependencies. */
export function downloadCsv(filename, contents) {
  const blob = new Blob([`﻿${contents}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
