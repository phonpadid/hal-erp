import { COMPANY_PALETTE, type ThemeColor } from "../constants";

/**
 * Stable, deterministic theming for company cards and logos.
 *
 * Replaces three duplicated copies of `getLogoBgColor` / `getLogoTextColor`
 * and the `getRandomColor()` helper in AffiliatedCompany — the random one
 * produced flickering colours on every keystroke because it ran inside a
 * computed property's hot path.
 *
 * `colorForCompany` derives the colour from the company id so the same
 * company always gets the same colour across reloads and filters.
 */
export function useCompanyTheme() {
  const BG: Record<ThemeColor, string> = {
    blue: "bg-blue-100",
    green: "bg-emerald-100",
    yellow: "bg-amber-100",
    purple: "bg-violet-100",
    orange: "bg-orange-100",
    red: "bg-rose-100",
    teal: "bg-teal-100",
    indigo: "bg-indigo-100",
    pink: "bg-pink-100",
    cyan: "bg-cyan-100",
    gray: "bg-gray-100",
  };

  const TEXT: Record<ThemeColor, string> = {
    blue: "text-blue-600",
    green: "text-emerald-600",
    yellow: "text-amber-600",
    purple: "text-violet-600",
    orange: "text-orange-600",
    red: "text-rose-600",
    teal: "text-teal-600",
    indigo: "text-indigo-600",
    pink: "text-pink-600",
    cyan: "text-cyan-600",
    gray: "text-gray-600",
  };

  const GRADIENT: Record<ThemeColor, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    yellow: "from-amber-500 to-amber-600",
    purple: "from-violet-500 to-violet-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-rose-500 to-rose-600",
    teal: "from-teal-500 to-teal-600",
    indigo: "from-indigo-500 to-indigo-600",
    pink: "from-pink-500 to-pink-600",
    cyan: "from-cyan-500 to-cyan-600",
    gray: "from-gray-500 to-gray-600",
  };

  const normalize = (color: string | undefined | null): ThemeColor => {
    if (!color) return "gray";
    const c = color.toLowerCase();
    return (BG as Record<string, unknown>)[c] ? (c as ThemeColor) : "gray";
  };

  const getBgClass = (color: string | undefined): string => BG[normalize(color)];
  const getTextClass = (color: string | undefined): string => TEXT[normalize(color)];
  const getGradientClass = (color: string | undefined): string => GRADIENT[normalize(color)];

  /** Pick a stable colour for a company based on its id. */
  const colorForCompany = (
    id: number | string,
    palette: readonly ThemeColor[] = COMPANY_PALETTE,
  ): ThemeColor => {
    const numeric = typeof id === "number" ? id : Number.parseInt(String(id), 10) || 0;
    const index = Math.abs(numeric) % palette.length;
    return palette[index];
  };

  /** Pick a stable colour based on the position in a list. */
  const colorAtIndex = (
    index: number,
    palette: readonly ThemeColor[] = COMPANY_PALETTE,
  ): ThemeColor => palette[index % palette.length];

  return {
    getBgClass,
    getTextClass,
    getGradientClass,
    colorForCompany,
    colorAtIndex,
  };
}
