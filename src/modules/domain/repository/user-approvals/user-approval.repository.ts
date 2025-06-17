
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { PurchaseRequestEntity } from "../../entities/purchase-requests/purchase-request.entity";

export interface PurchaseRequestRepository {
  create(input: PurchaseRequestEntity): Promise<PurchaseRequestEntity>;
  findById(id: string): Promise<PurchaseRequestEntity | null>;
  findAll(query: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<PurchaseRequestEntity>>;
  update(id: string, input: PurchaseRequestEntity): Promise<PurchaseRequestEntity>;
  delete(id: string): Promise<boolean>;
}
