import type { ReceiptRepository } from "@/modules/domain/repository/receipt.repository";
import type { IReportReceiptCount } from "../../dtos/receipt.dto";

export class ReceiptReportMenuUseCase {
  constructor(private readonly repo: ReceiptRepository) {}

  async execute(type: string): Promise<IReportReceiptCount> {
    return await this.repo.reportMenu(type);
  }
}
