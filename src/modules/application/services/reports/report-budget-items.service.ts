import type { ReportBudgetItemsRepository } from "@/modules/domain/repository/reports/report-budget-items.repository";
import type { BudgetItemsReportData, BudgetItemsParams } from "@/modules/infrastructure/reports/report-budget-items.repository";
import { ApiReportBudgetItemsRepository } from "@/modules/infrastructure/reports/report-budget-items.repository";

export class ReportBudgetItemsService {
  private readonly reportBudgetItemsRepository: ReportBudgetItemsRepository;

  constructor() {
    this.reportBudgetItemsRepository = new ApiReportBudgetItemsRepository();
  }

  async getBudgetItemsReport(params: BudgetItemsParams): Promise<BudgetItemsReportData> {
    return await this.reportBudgetItemsRepository.getBudgetItemsReport(params);
  }
}