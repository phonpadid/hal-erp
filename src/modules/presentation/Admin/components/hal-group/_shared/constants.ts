/**
 * Shared constants for the hal-group dashboard UI.
 *
 * Centralising these stops the same palette/threshold values from being
 * copy-pasted across OverView, CompanyDetail, AffiliatedCompany, BudgetList.
 */

export type ThemeColor =
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "orange"
  | "red"
  | "teal"
  | "indigo"
  | "pink"
  | "cyan"
  | "gray";

/** Stable palette used to colour company cards. */
export const COMPANY_PALETTE: readonly ThemeColor[] = [
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "red",
  "teal",
  "indigo",
  "pink",
  "cyan",
] as const;

/** Palette used for the "over budget" bucket (warmer tones). */
export const OVER_BUDGET_PALETTE: readonly ThemeColor[] = [
  "red",
  "orange",
  "yellow",
  "purple",
  "pink",
] as const;

/** Palette used for the "within budget" bucket (cooler tones). */
export const WITHIN_BUDGET_PALETTE: readonly ThemeColor[] = [
  "green",
  "blue",
  "teal",
  "indigo",
  "cyan",
] as const;

/** Budget usage thresholds, in percent. */
export const BUDGET_THRESHOLDS = {
  idle: 0,
  safe: 70,
  warning: 90,
  full: 100,
} as const;

export type BudgetSeverity = "idle" | "safe" | "warning" | "danger" | "over";

/** Currency configuration. The locale produces "₭" + amount in Lao. */
export const DEFAULT_CURRENCY = {
  code: "LAK",
  locale: "lo-LA",
  symbol: "₭",
} as const;
