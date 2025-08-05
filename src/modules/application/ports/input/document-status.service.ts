import type { DocumentStatusEntity } from "@/modules/domain/entities/document-status.entity";

import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface DocumentStatusService {

  getAllDocumentStatus(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DocumentStatusEntity>>;

}
