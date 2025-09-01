import type { ReceiptRepository } from "@/modules/domain/repository/receipt.repository";
import type { CreateReceiptDTO } from "../../dtos/receipt.dto";
import { ReceiptEntity } from "@/modules/domain/entities/receipts/receipt.entity";

export class CreateReceiptUseCase {
  constructor(private readonly repo: ReceiptRepository) {}

  async execute(input: CreateReceiptDTO): Promise<ReceiptEntity> {
      return await this.repo.create(input);
    }
}
