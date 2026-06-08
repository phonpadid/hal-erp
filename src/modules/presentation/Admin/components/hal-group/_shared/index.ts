/**
 * Barrel export for the hal-group shared primitives.
 * Importers do `import { SummaryCard, MoneyText, ... } from "../_shared"`.
 */
export { default as SummaryCard } from "./components/SummaryCard.vue";
export { default as MoneyText } from "./components/MoneyText.vue";
export { default as BudgetBar } from "./components/BudgetBar.vue";
export { default as CompanyLogo } from "./components/CompanyLogo.vue";
export { default as CompanyCard } from "./components/CompanyCard.vue";
export { default as CompanyBudgetRow } from "./components/CompanyBudgetRow.vue";
export { default as BudgetUsageChart } from "./components/BudgetUsageChart.vue";
export { default as EmptyState } from "./components/EmptyState.vue";
export { default as LoadingSpinner } from "./components/LoadingSpinner.vue";
export { default as SectionHeader } from "./components/SectionHeader.vue";

export { useDashboardFormat } from "./composables/useDashboardFormat";
export { useBudgetStatus } from "./composables/useBudgetStatus";
export { useCompanyTheme } from "./composables/useCompanyTheme";
export { useBreakpoint } from "./composables/useBreakpoint";

export * from "./constants";
