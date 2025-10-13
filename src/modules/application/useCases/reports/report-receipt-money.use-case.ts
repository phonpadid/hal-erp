import type { ReportPurchaseRequestRepository } from "@/modules/domain/repository/reports/report-purchase-request";
import type { IReportReceiptMoney } from "../../dtos/report/report-pr.dto";

export class ReportReceiptMoneyUseCase {
  constructor(private readonly repo: ReportPurchaseRequestRepository) {}

  async execute(): Promise<IReportReceiptMoney> {
    return await this.repo.reportReceiptMoney();
  }
}
