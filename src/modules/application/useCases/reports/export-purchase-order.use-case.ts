import type { ReportPurchaseOrderRepository } from "@/modules/domain/repository/reports/report-purchase-order";

export class ExportPurchaseOrderUseCase {
  constructor(private readonly repo: ReportPurchaseOrderRepository) {}

  async exportPo(id: string): Promise<Blob> {
    return await this.repo.reportPoExport(id);
  }
}
