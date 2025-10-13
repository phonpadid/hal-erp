import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ReportPurchaseQuestService } from "../../ports/input/reports/report-purchase-quest.service";
import type { IReportMoney, IReportPurchaseRequestDto, IReportReceiptMoney } from "../../dtos/report/report-pr.dto";
import type { ReportPurchaseRequestRepository } from "@/modules/domain/repository/reports/report-purchase-request";
import { ReportPurchaseRequestUseCase } from "../../useCases/reports/report-purchase-request.use-case";
import { ReportMoneyUseCase } from "../../useCases/reports/report-money.use-case copy";
import { ReportReceiptMoneyUseCase } from "../../useCases/reports/report-receipt-money.use-case";

export class ReportPurchaseRequestImpl implements ReportPurchaseQuestService {
  private readonly reportPr: ReportPurchaseRequestUseCase;
  private readonly reportMoneyUsecase: ReportMoneyUseCase;
  private readonly reportReceiptMoneyUsecase: ReportReceiptMoneyUseCase;

  constructor(
    private readonly repo: ReportPurchaseRequestRepository) {
    this.reportPr = new ReportPurchaseRequestUseCase(repo);
    this.reportMoneyUsecase = new ReportMoneyUseCase(repo);
    this.reportReceiptMoneyUsecase = new ReportReceiptMoneyUseCase(repo);
  }
  async reportPurchaseQuest(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<IReportPurchaseRequestDto>> {
    return await this.reportPr.execute(params, includeDeleted);
  }
  async reportMoney(): Promise<IReportMoney> {
    return await this.reportMoneyUsecase.execute();
  }
  async reportReceiptMoney(): Promise<IReportReceiptMoney> {
    return await this.reportReceiptMoneyUsecase.execute();
  }

}
