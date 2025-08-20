import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreatePurchaseOrderDTO,UpdatePurchaseOrderDTO } from "../../dtos/purchase-order/purchase-order.dto";
import type { PurchaseOrderEntity } from "@/modules/domain/entities/purchase-order/purchase-order.entity";

export interface PurchaseOrderService {
  create(input: CreatePurchaseOrderDTO): Promise<PurchaseOrderEntity>;
  getById(id: number): Promise<PurchaseOrderEntity | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<PurchaseOrderEntity>>;
  update(id: number, input: UpdatePurchaseOrderDTO): Promise<PurchaseOrderEntity>;
  delete(id: number): Promise<boolean>;
}
