import type { ReportBudgetAccountsRepository } from "@/modules/domain/repository/reports/report-budget-accounts.repository";
import type { BudgetAccountsReportData } from "@/modules/infrastructure/reports/report-budget-accounts.repository";
import { ApiReportBudgetAccountsRepository } from "@/modules/infrastructure/reports/report-budget-accounts.repository";

export class ReportBudgetAccountsService {
  private readonly reportBudgetAccountsRepository: ReportBudgetAccountsRepository;

  constructor() {
    this.reportBudgetAccountsRepository = new ApiReportBudgetAccountsRepository();
  }

  async getReportToUseBudget(companyId: number, fiscalYear: number): Promise<BudgetAccountsReportData> {
    return await this.reportBudgetAccountsRepository.getReportToUseBudget(companyId, fiscalYear);
  }
}