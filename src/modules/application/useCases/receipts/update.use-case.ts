import type { ReceiptRepository } from "@/modules/domain/repository/receipt.repository";
import type { ReceiptEntity } from "@/modules/domain/entities/receipts/receipt.entity";
import type { UpdateReceiptDTO } from "../../dtos/receipt.dto";

export class UpdateReceiptUseCase {
  constructor(private readonly repo: ReceiptRepository) { }
  async execute(id: string, input: UpdateReceiptDTO[]): Promise<ReceiptEntity> {
    return await this.repo.update(id, input);
  }
}
