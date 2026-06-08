import { BUDGET_THRESHOLDS, type BudgetSeverity } from "../constants";

/**
 * Budget-usage severity helpers.
 *
 * Replaces the four copies of `getBudgetPercentage` and three slightly
 * divergent copies of `getBudgetBarColor` in OverView, AffiliatedCompany and
 * BudgetList. Centralising the thresholds means changing the "warning" band
 * happens in exactly one place.
 */
export function useBudgetStatus() {
  const getBudgetPercentage = (
    used: number | null | undefined,
    allocated: number | null | undefined,
  ): number => {
    const u = Number(used ?? 0);
    const a = Number(allocated ?? 0);
    if (!a || !Number.isFinite(a)) return 0;
    if (!u || !Number.isFinite(u)) return 0;
    return Math.round((u / a) * 100);
  };

  const getSeverity = (percentage: number): BudgetSeverity => {
    if (!Number.isFinite(percentage) || percentage <= BUDGET_THRESHOLDS.idle) return "idle";
    if (percentage > BUDGET_THRESHOLDS.full) return "over";
    if (percentage > BUDGET_THRESHOLDS.warning) return "danger";
    if (percentage > BUDGET_THRESHOLDS.safe) return "warning";
    return "safe";
  };

  const BAR_CLASS: Record<BudgetSeverity, string> = {
    idle: "bg-gray-200",
    safe: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-orange-500",
    over: "bg-rose-500",
  };

  const TEXT_CLASS: Record<BudgetSeverity, string> = {
    idle: "text-gray-500",
    safe: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-orange-600",
    over: "text-rose-600",
  };

  const TRACK_CLASS: Record<BudgetSeverity, string> = {
    idle: "bg-gray-100",
    safe: "bg-gray-200",
    warning: "bg-amber-100",
    danger: "bg-orange-100",
    over: "bg-rose-100",
  };

  const getBarColor = (percentage: number): string => BAR_CLASS[getSeverity(percentage)];
  const getTextColor = (percentage: number): string => TEXT_CLASS[getSeverity(percentage)];
  const getTrackColor = (percentage: number): string => TRACK_CLASS[getSeverity(percentage)];

  return {
    getBudgetPercentage,
    getSeverity,
    getBarColor,
    getTextColor,
    getTrackColor,
  };
}
