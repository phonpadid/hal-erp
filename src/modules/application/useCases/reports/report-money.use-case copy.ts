import type { ReportPurchaseRequestRepository } from "@/modules/domain/repository/reports/report-purchase-request";
import type { IReportMoney } from "../../dtos/report/report-pr.dto";

export class ReportMoneyUseCase {
  constructor(private readonly repo: ReportPurchaseRequestRepository) {}

  async execute(): Promise<IReportMoney> {
    return await this.repo.reportMoney();
  }
}
