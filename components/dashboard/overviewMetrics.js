import {
  calculateChange,
  formatCurrency,
  formatDecimal,
  formatNumber,
  monthLabel,
} from "@/lib/utils";
import { SERIES } from "@/lib/palette";

/* ---------------------------------------------------------------------------
   Pure derivation for the overview screen. Keeping the arithmetic here means the
   dashboard component is only layout, which is what makes it readable.
   --------------------------------------------------------------------------- */

const CHANNEL_LABELS = {
  Search: "Organic Search",
  Social: "Paid Social",
  Email: "Email",
  Paid: "Google Ads",
};



export const PIPELINE_STAGES = ["New", "Contacted", "Qualified", "Won"];

const STAGE_CAPTIONS = {
  New: (stage, total) => `${stage.count} of ${total} leads entered this stage`,
  Contacted: (stage, _total, previous) =>
    `${previous ? Math.round((stage.count / previous) * 100) : 0}% of new leads reached`,
  Qualified: (stage, _total, previous) =>
    `${previous ? Math.round((stage.count / previous) * 100) : 0}% of contacted leads qualified`,
  Won: (stage, _total, previous) =>
    `${previous ? Math.round((stage.count / previous) * 100) : 0}% of qualified leads closed`,
};

function monthRangeLabel(date) {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  return `1 ${month} – ${end.getDate()} ${month} ${date.getFullYear()}`;
}

function comparisonRangeLabel(date) {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  return `compared with 1–${end.getDate()} ${month} ${date.getFullYear()}`;
}

/**
 * The reporting window is the last complete month in the series, compared with
 * the one before it.
 */
export function getReportingWindow(series = []) {
  const lastPoint = series.at(-1);
  const base = lastPoint?.month ? new Date(lastPoint.month) : new Date();
  const active = new Date(base.getFullYear(), base.getMonth() - 1, 1);
  const previous = new Date(active.getFullYear(), active.getMonth() - 1, 1);

  return {
    range: monthRangeLabel(active),
    comparison: comparisonRangeLabel(previous),
    previousMonthName: new Intl.DateTimeFormat("en-US", { month: "long" }).format(previous),
  };
}

export function getKpiItems(bundle) {
  const series = bundle.series || [];
  const campaigns = bundle.campaigns || [];
  const leads = bundle.leads || [];
  const kpis = bundle.kpis || {};
  const window = getReportingWindow(series);

  const totalLeads = bundle.leadCount ?? leads.length;
  const totalSpend = campaigns.reduce((total, item) => total + Number(item.spent || 0), 0);
  const totalConversions = campaigns.reduce(
    (total, item) => total + Number(item.conversions || 0),
    0,
  );
  const previousMonth = series.at(-2) || {};
  const costPerLead = totalLeads ? totalSpend / totalLeads : 0;

  return [
    {
      label: "Leads",
      value: formatNumber(totalLeads),
      change: calculateChange(totalLeads, previousMonth.leads),
      note: `${formatNumber(previousMonth.leads || 0)} in ${window.previousMonthName}`,
      spark: series.map((point) => point.leads),
    },
    {
      label: "Conversions",
      value: formatNumber(totalConversions),
      change: calculateChange(kpis.conversions?.current, kpis.conversions?.previous),
      note: `across ${campaigns.length} attributed campaigns`,
      spark: series.map((point) => point.conversions),
    },
    {
      label: "Cost per lead",
      value: formatCurrency(costPerLead, "USD", false),
      change: calculateChange(kpis.costPerLead?.current, kpis.costPerLead?.previous),
      note: `${formatCurrency(totalSpend, "USD", true)} spend across ${campaigns.length} campaigns`,
      spark: series.map((point) => point.spend / Math.max(1, point.leads)),
    },
    {
      label: "Return on spend",
      value: `${formatDecimal(kpis.roi?.current ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×`,
      change: calculateChange(kpis.roi?.current, kpis.roi?.previous),
      note: `${formatCurrency(totalSpend, "USD", true)} spend to date`,
      spark: series.map((point) => (point.spend ? point.conversions / point.spend : 0)),
    },
  ];
}

/**
 * The three trend metrics share one month axis. `indexed` rebases each of them
 * to 100 at the first month so they can be read on a single scale.
 */
export function getPerformanceMetrics(series = []) {
  const points = series.map((point) => ({
    label: monthLabel(point.month),
    leadEfficiency: point.spend ? (point.leads / point.spend) * 1000 : 0,
    conversionRate: point.traffic ? (point.conversions / point.traffic) * 100 : 0,
    costPerLead: point.leads ? point.spend / point.leads : 0,
  }));

  const definitions = [
    {
      key: "leadEfficiency",
      label: "Leads per $1k spend",
      color: SERIES.mid,
      format: (value) =>
        formatDecimal(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      // Ranges read coarser than the headline figure.
      rangeFormat: (value) =>
        formatDecimal(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
      key: "conversionRate",
      label: "Conversion rate",
      color: SERIES.ink,
      format: (value) => `${formatDecimal(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
    },
    {
      key: "costPerLead",
      label: "Cost per lead",
      color: SERIES.light,
      format: (value) => formatCurrency(value, "USD", false),
    },
  ];

  const metrics = definitions.map((definition) => {
    const values = points.map((point) => point[definition.key]);
    return {
      rangeFormat: definition.format,
      ...definition,
      values,
      latest: values.at(-1) ?? 0,
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
      // Rebased so all three series share one axis in indexed mode.
      indexed: values.map((value) => (values[0] ? (value / values[0]) * 100 : 100)),
    };
  });

  return { months: points.map((point) => point.label), metrics };
}

export function getChannelLegend(bundle) {
  const totals = (bundle.campaigns || []).reduce((acc, campaign) => {
    const name = CHANNEL_LABELS[campaign.channel] || campaign.channel;
    acc[name] = (acc[name] || 0) + Number(campaign.conversions || 0);
    return acc;
  }, {});

  const leadTotal = bundle.leadCount ?? (bundle.leads || []).length;
  const conversionTotal = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;

  const rows = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, conversions]) => {
      const share = Math.round((conversions / conversionTotal) * 100);
      return { name, share, count: Math.round((share / 100) * leadTotal) };
    });

  const accounted = rows.reduce((sum, row) => sum + row.share, 0);
  if (accounted < 100) {
    rows.push({
      name: "Other",
      share: 100 - accounted,
      count: Math.max(0, leadTotal - rows.reduce((sum, row) => sum + row.count, 0)),
    });
  }

  return { rows, leadTotal };
}

export function getPipelineStages(bundle) {
  // Counts come straight from the database as an aggregate. The lead-record
  // fallback stays for any caller that still hands over the full list.
  const counts =
    bundle.leadStatusCounts ||
    (bundle.leads || []).reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});
  const total =
    bundle.leadCount ??
    Object.values(counts).reduce((sum, count) => sum + count, 0);

  return PIPELINE_STAGES.map((label, index) => {
    const stage = { label, count: counts[label] || 0 };
    const previous = index ? counts[PIPELINE_STAGES[index - 1]] || 0 : 0;

    return {
      ...stage,
      share: total ? (stage.count / total) * 100 : 0,
      caption: STAGE_CAPTIONS[label](stage, total, previous),
    };
  });
}

export function getCampaignRows(bundle) {
  const campaigns = bundle.topCampaigns || bundle.campaigns || [];
  const maxSpend = Math.max(1, ...campaigns.map((item) => Number(item.spent || 0)));

  return campaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    channel: CHANNEL_LABELS[campaign.channel] || campaign.channel,
    spend: formatCurrency(campaign.spent, "USD", false),
    share: (Number(campaign.spent || 0) / maxSpend) * 100,
    detail: `${campaign.conversions} conv · ${formatCurrency(
      campaign.conversions ? campaign.spent / campaign.conversions : 0,
      "USD",
      false,
    )} CPA`,
  }));
}

/** Relative timestamps for the activity feed, newest first. */
export function relativeTime(index) {
  return ["2m", "15m", "1h", "2h", "3h", "5h"][index] || "1d";
}
