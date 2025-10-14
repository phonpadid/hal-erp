import type { ReportPurchaseRequestRepository } from "@/modules/domain/repository/reports/report-purchase-request";
import type { IReportMoney } from "../../dtos/report/report-pr.dto";
import type { ReportPurchaseOrderRepository } from "@/modules/domain/repository/reports/report-purchase-order";

export class ReportMoneyUseCase {
  constructor(private readonly repo: ReportPurchaseRequestRepository) {}

  async execute(): Promise<IReportMoney> {
    return await this.repo.reportMoney();
  }
}

export class ReportMoneyUseCasePurchaseOrder {
  constructor(private readonly repo: ReportPurchaseOrderRepository) {}

  async execute(): Promise<IReportMoney> {
    return await this.repo.reportMoney();
  }
}
