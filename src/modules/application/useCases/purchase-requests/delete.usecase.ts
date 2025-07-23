import type { PurchaseRequestRepository } from "@/modules/domain/repository/purchase-requests/purchase-request.repository";

export class DeletePurchaseRequestUseCase {
  constructor(private readonly repository: PurchaseRequestRepository) {}

  async execute(id: string): Promise<boolean> {
    const res = await this.repository.findById(id);
    if (!res) {
      throw new Error(` with id ${id} not found`);
    }
    if (res.isDeleted()) {
      throw new Error(` with id ${id} is already deleted`);
    }
    return await this.repository.delete(id);
  }
}
