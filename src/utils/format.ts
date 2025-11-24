export const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);

export const formatPercent = (value: number, digits = 2) =>
  `${Number(value).toFixed(digits)}%`;

