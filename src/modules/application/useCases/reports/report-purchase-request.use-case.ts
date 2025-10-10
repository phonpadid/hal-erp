import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ReportPurchaseRequestRepository } from "@/modules/domain/repository/reports/report-purchase-request";
import type { IReportPurchaseRequestDto } from "../../dtos/report/report-pr.dto";

export class ReportPurchaseRequestUseCase {
  constructor(private readonly repo: ReportPurchaseRequestRepository) {}

  async execute(
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<IReportPurchaseRequestDto>> {
    return await this.repo.reportPr(params, includeDeleted);
  }
}
