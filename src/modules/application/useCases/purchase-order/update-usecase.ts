import type { PurchaseOrderRepository } from "@/modules/domain/repository/purchase-order/purchase-order.repository";

export class DeletePurchaseOrderUseCase {
  constructor(private readonly repository: PurchaseOrderRepository) {}

  async execute(id: number): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
