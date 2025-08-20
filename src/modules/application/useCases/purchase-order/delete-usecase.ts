import type { PurchaseOrderRepository } from "@/modules/domain/repository/purchase-order/purchase-order.repository";
import type { UpdatePurchaseOrderDTO } from "../../dtos/purchase-order/purchase-order.dto";
import { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";

export class UpdatePurchaseOrderUseCase {
  constructor(private readonly repository: PurchaseOrderRepository) {}

  async execute(id: number, input: UpdatePurchaseOrderDTO): Promise<PurchaseOrderEntity> {
    // 1. Check if exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Purchase order with id ${id} not found`);
    }

    // 2. Create updated entity
    const updatedPO = PurchaseOrderEntity.create({
      id,
      purchase_request_id: input.purchase_request_id,
      document: input.document,
      items: input.items,

    });

    // 3. Save to repository
    return await this.repository.update(id, updatedPO);
  }
}
