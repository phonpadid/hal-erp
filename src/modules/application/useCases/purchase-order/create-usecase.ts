import type { PurchaseOrderRepository } from "@/modules/domain/repository/purchase-order/purchase-order.repository";
import type { CreatePurchaseOrderDTO } from "../../dtos/purchase-order/purchase-order.dto";
import { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";

export class CreatePurchaseOrderUseCase {
  constructor(private readonly repository: PurchaseOrderRepository) {}

  async execute(input: CreatePurchaseOrderDTO): Promise<PurchaseOrderEntity> {
    // 1. Create entity from DTO
    const purchaseOrder = PurchaseOrderEntity.create({
      purchase_request_id: input.purchase_request_id,
      document: input.document,
      items: input.items,
    });

    // 2. Save to repository
    return await this.repository.create(purchaseOrder);
  }
}
