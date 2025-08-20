import type { PurchaseOrderRepository } from "@/modules/domain/repository/purchase-order/purchase-order.repository";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";

export class GetOnePurchaseOrderUseCase {
  constructor(private readonly repository: PurchaseOrderRepository) {}

  async execute(id: number): Promise<PurchaseOrderEntity | null> {
    return await this.repository.findById(id);
  }
}
