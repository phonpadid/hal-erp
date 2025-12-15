import type { BudgetAccountsReportData } from "@/modules/infrastructure/reports/report-budget-accounts.repository";

export interface ReportBudgetAccountsRepository {
  getReportToUseBudget(companyId: number, fiscalYear: number): Promise<BudgetAccountsReportData>;
}