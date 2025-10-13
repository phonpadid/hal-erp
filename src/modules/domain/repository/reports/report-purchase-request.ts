
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { IReportMoney, IReportPurchaseRequestDto } from "@/modules/application/dtos/report/report-pr.dto";

export interface ReportPurchaseRequestRepository {
  reportPr(query: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<IReportPurchaseRequestDto>>;
  reportMoney(): Promise<IReportMoney>;
}
