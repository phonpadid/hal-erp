
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { IReportPo,IReportMoneyPo } from "@/modules/application/dtos/report/report-po.dto";

export interface ReportPurchaseOrderRepository {
  reportPo(query: PaginationParams): Promise<PaginatedResult<IReportPo>>;
  reportMoney(): Promise<IReportMoneyPo>;
}
