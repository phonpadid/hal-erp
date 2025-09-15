import type { ReceiptRepository } from "@/modules/domain/repository/receipt.repository";
import type { ReciptQueryDto } from "../../dtos/receipt.dto";

export class GetOneReceiptUseCase {
  constructor(private readonly repo: ReceiptRepository) { }

  async execute(
    id: string
  ): Promise<ReciptQueryDto | null> {
    return await this.repo.findById(id);
  }
}
