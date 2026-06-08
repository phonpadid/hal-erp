import { DEFAULT_CURRENCY } from "../constants";

/**
 * Currency and number formatters used across the hal-group dashboards.
 *
 * Replaces the four near-identical copies of `formatCurrency` and the two
 * conflicting copies of `formatLargeNumber` that lived in OverView,
 * CompanyDetail, AffiliatedCompany and BudgetList.
 *
 * Intl.NumberFormat instances are cached because constructing them on every
 * call inside a hot template path (budget bars, summary cards, tables) is
 * measurable on lower-end devices.
 */

const formatterCache = new Map<string, Intl.NumberFormat>();

const getFormatter = (
  locale: string,
  currency: string,
  decimals: number,
  withSymbol: boolean,
): Intl.NumberFormat => {
  const key = `${locale}|${currency}|${decimals}|${withSymbol}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: withSymbol ? "currency" : "decimal",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatterCache.set(key, formatter);
  }
  return formatter;
};

export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  /** When true, drop the locale's ISO code and show the symbol instead. */
  withSymbol?: boolean;
  decimals?: number;
}

export function useDashboardFormat() {
  const formatCurrency = (
    value: number | null | undefined,
    options: CurrencyFormatOptions = {},
  ): string => {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) return "—";

    const {
      currency = DEFAULT_CURRENCY.code,
      locale = DEFAULT_CURRENCY.locale,
      withSymbol = true,
      decimals = 0,
    } = options;

    const formatter = getFormatter(locale, currency, decimals, withSymbol);
    const formatted = formatter.format(amount);

    // The Lao locale renders the ISO code "LAK"; swap to the local symbol so
    // every dashboard speaks the same visual language.
    if (withSymbol && currency === DEFAULT_CURRENCY.code) {
      return formatted.replace(currency, DEFAULT_CURRENCY.symbol);
    }
    return formatted;
  };

  /**
   * Abbreviate a large number for compact display (e.g. "1.2B", "350K").
   * Returns the symbol-prefixed form when `withSymbol` is true so the same
   * helper covers both currency and plain numeric displays.
   */
  const formatLargeNumber = (
    value: number | null | undefined,
    options: { withSymbol?: boolean; symbol?: string; decimals?: number } = {},
  ): string => {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) return "—";

    const {
      withSymbol = false,
      symbol = DEFAULT_CURRENCY.symbol,
      decimals = 1,
    } = options;

    const prefix = withSymbol ? symbol : "";
    const abs = Math.abs(amount);

    if (abs >= 1e9) return `${prefix}${(amount / 1e9).toFixed(decimals)}B`;
    if (abs >= 1e6) return `${prefix}${(amount / 1e6).toFixed(decimals)}M`;
    if (abs >= 1e3) return `${prefix}${(amount / 1e3).toFixed(decimals)}K`;
    return `${prefix}${Math.round(amount)}`;
  };

  const formatPercent = (
    value: number | null | undefined,
    options: { decimals?: number } = {},
  ): string => {
    const pct = Number(value ?? 0);
    if (!Number.isFinite(pct)) return "0%";
    const { decimals = 0 } = options;
    return `${pct.toFixed(decimals)}%`;
  };

  /** Safe division that returns 0 instead of NaN/Infinity. */
  const safeRatio = (numerator: number, denominator: number): number => {
    if (!denominator || !Number.isFinite(denominator)) return 0;
    if (!Number.isFinite(numerator)) return 0;
    return numerator / denominator;
  };

  return {
    formatCurrency,
    formatLargeNumber,
    formatPercent,
    safeRatio,
  };
}
