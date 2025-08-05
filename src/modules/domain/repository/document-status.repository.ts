import type { DocumentStatusEntity } from "../entities/document-status.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface DocumentStatusRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<DocumentStatusEntity>>;
}
