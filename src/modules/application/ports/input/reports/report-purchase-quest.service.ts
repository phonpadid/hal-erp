import type { IReportMoney, IReportPurchaseRequestDto, IReportReceiptMoney } from "@/modules/application/dtos/report/report-pr.dto";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
export interface ReportPurchaseQuestService {
  reportPurchaseQuest(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<IReportPurchaseRequestDto>>;
  reportMoney(): Promise<IReportMoney>;
  reportReceiptMoney(): Promise<IReportReceiptMoney>;
}
