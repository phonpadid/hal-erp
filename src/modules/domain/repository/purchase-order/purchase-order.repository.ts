import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { PurchaseOrderEntity } from "../../entities/purchase-order/purchase-order.entity";

export interface PurchaseOrderRepository {
  create(input: PurchaseOrderEntity): Promise<PurchaseOrderEntity>;
  findById(id: number): Promise<PurchaseOrderEntity | null>;
  findAll(params: PaginationParams): Promise<PaginatedResult<PurchaseOrderEntity>>;
  update(id: number, purchaseOrder: PurchaseOrderEntity): Promise<PurchaseOrderEntity>;
  delete(id: number): Promise<boolean>;
}
