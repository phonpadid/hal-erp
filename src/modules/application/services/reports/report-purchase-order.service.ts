import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ReportPurchaseOrderService } from "../../ports/input/reports/report-purchase-order.service";
import type { IReportPo,IReportMoneyPo } from "../../dtos/report/report-po.dto";
import type { ReportPurchaseOrderRepository } from "@/modules/domain/repository/reports/report-purchase-order";
import { ReportPurchaseOrderUseCase } from "../../useCases/reports/report-purchase-order.use-case";
import { ReportMoneyUseCasePurchaseOrder } from "../../useCases/reports/report-money.use-case";
export class ReportPurchaseOrderImpl implements ReportPurchaseOrderService {
  private readonly reportPo: ReportPurchaseOrderUseCase;
  private readonly reportMoneyUsecase: ReportMoneyUseCasePurchaseOrder;
  constructor(
    private readonly repo: ReportPurchaseOrderRepository) {
    this.reportPo = new ReportPurchaseOrderUseCase(repo);
    this.reportMoneyUsecase = new ReportMoneyUseCasePurchaseOrder(repo);
  }
  async reportPurchaseOrder(
    params: PaginationParams,
  ): Promise<PaginatedResult<IReportPo>> {
    return await this.reportPo.reportPurchaseOrder(params);
  }
  async reportMoney(): Promise<IReportMoneyPo> {
    return await this.reportMoneyUsecase.execute();
  }
  async reportPoExport(id: string): Promise<Blob> {
    return await this.repo.reportPoExport(id);
  }
}
