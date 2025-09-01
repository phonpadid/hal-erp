import type { ReceiptEntity } from "@/modules/domain/entities/receipts/receipt.entity";
import type { ReceiptRepository } from "@/modules/domain/repository/receipt.repository";

export class GetOneReceiptUseCase {
  constructor(private readonly repo: ReceiptRepository) { }

  async execute(
    id: string
  ): Promise<ReceiptEntity | null> {
    return await this.repo.findById(id);
  }
}
