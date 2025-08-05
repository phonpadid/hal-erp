import type { DocumentStatusEntity } from "@/modules/domain/entities/document-status.entity";
import type { DocumentStatusRepository } from "@/modules/domain/repository/document-status.repository";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";

export class GetAllDocumentStatusUseCase {
  constructor(private readonly documentStatusRepository: DocumentStatusRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DocumentStatusEntity>> {
    return await this.documentStatusRepository.findAll(params, includeDeleted);
  }
}
