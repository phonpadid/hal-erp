import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { PurchaseOrderRepository } from "@/modules/domain/repository/purchase-order/purchase-order.repository";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";
export class GetAllPurchaseOrderUseCase {
  constructor(private readonly repository: PurchaseOrderRepository) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<PurchaseOrderEntity>> {
    return await this.repository.findAll({
      ...params,
    });
  }
}
