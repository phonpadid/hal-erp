import type {IReportPo, IReportMoneyPo} from "@/modules/application/dtos/report/report-po.dto";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
export interface ReportPurchaseOrderService {
  reportPurchaseOrder(
    params: PaginationParams,
  ): Promise<PaginatedResult<IReportPo>>;
  reportMoney(): Promise<IReportMoneyPo>;
}
