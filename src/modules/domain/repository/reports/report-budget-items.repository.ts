import type { BudgetItemsReportData, BudgetItemsParams } from "@/modules/infrastructure/reports/report-budget-items.repository";

export interface ReportBudgetItemsRepository {
  getBudgetItemsReport(params: BudgetItemsParams): Promise<BudgetItemsReportData>;
}