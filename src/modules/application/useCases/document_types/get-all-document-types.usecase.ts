import type { DocumentTypeRepository } from "@/modules/domain/repository/document-type.repository";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllDocumentTypeUseCase {
  constructor(private readonly documentTypeRepository: DocumentTypeRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DocumentTypeEntity>> {
    return await this.documentTypeRepository.findAll(params, includeDeleted);
  }
}
