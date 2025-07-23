
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { PurchaseRequestEntity } from "../../entities/purchase-requests/purchase-request.entity";
import type { PurchaseRequestItemEntity } from "../../entities/purchase-requests/purchase-request-item.entity";

export interface PurchaseRequestRepository {
  create(input: {
    purchaseRequest: PurchaseRequestEntity;
    items: PurchaseRequestItemEntity[];
  }): Promise<PurchaseRequestEntity>;
  findById(id: string): Promise<PurchaseRequestEntity | null>;
  findAll(query: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<PurchaseRequestEntity>>;
  update(id: string, input: PurchaseRequestItemEntity): Promise<PurchaseRequestItemEntity>;
  delete(id: string): Promise<boolean>;
}
