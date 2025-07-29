import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreatePurchaseRequestDTO } from "../../dtos/purchase-requests/purchase-request.dto";
import type { UpdatePurchaseRequestDTO } from "../../dtos/purchase-requests/purchase-request.dto";
import type { PurchaseRequestEntity } from "@/modules/domain/entities/purchase-requests/purchase-request.entity";

export interface PurchaseRequestService {
  create(input: CreatePurchaseRequestDTO): Promise<PurchaseRequestEntity>;
  getById(id: string): Promise<PurchaseRequestEntity | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<PurchaseRequestEntity>>;
  update(id: string, input: UpdatePurchaseRequestDTO): Promise<PurchaseRequestEntity>;
  delete(id: string): Promise<boolean>;
}
