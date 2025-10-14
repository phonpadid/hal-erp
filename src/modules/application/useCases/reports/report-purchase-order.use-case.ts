import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ReportPurchaseOrderRepository } from "@/modules/domain/repository/reports/report-purchase-order";
import type { IReportPo } from "../../dtos/report/report-po.dto";

export class ReportPurchaseOrderUseCase {
  constructor(private readonly repo: ReportPurchaseOrderRepository) {}

  async reportPurchaseOrder(
    params: PaginationParams = { page: 1, limit: 10 },
  ): Promise<PaginatedResult<IReportPo>> {
    return await this.repo.reportPo(params);
  }
}