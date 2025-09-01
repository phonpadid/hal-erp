import type { ReceiptRepository } from "@/modules/domain/repository/receipt.repository";

export class DeleteReceiptUseCase {
  constructor(private readonly repo: ReceiptRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.repo.delete(id);
  }
}
