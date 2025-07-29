import type { PurchaseRequestEntity } from "../../entities/purchase-requests/purchase-request.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface PurchaseRequestRepository {
  create(input: PurchaseRequestEntity): Promise<PurchaseRequestEntity>;
  findById(id: string): Promise<PurchaseRequestEntity | null>;
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<PurchaseRequestEntity>>;
  update(input: PurchaseRequestEntity): Promise<PurchaseRequestEntity>;
  delete(id: string): Promise<boolean>;
}
