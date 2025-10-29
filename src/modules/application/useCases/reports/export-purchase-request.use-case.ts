import type { ReportPurchaseRequestRepository } from "@/modules/domain/repository/reports/report-purchase-request";


export class ExportPurchaseRequUseCase {
  constructor(private readonly repo: ReportPurchaseRequestRepository) {}

  async exportPr(id: string): Promise<Blob> {
    return await this.repo.reportPrExport(id);
  }
}