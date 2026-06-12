export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCurrency(value, currency = "USD", compact = false) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: currency === "EUR" ? 1 : 2,
  }).format(value);
}

export function formatPercent(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function monthLabel(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date(value));
}

export function calculateChange(current, previous) {
  if (!previous) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

export function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key];
    acc[value] = acc[value] || [];
    acc[value].push(item);
    return acc;
  }, {});
}

export function sum(items, selector) {
  return items.reduce((total, item) => total + selector(item), 0);
}
