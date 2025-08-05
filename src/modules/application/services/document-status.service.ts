import type { DocumentStatusRepository } from "@/modules/domain/repository/document-status.repository";
import type { DocumentStatusEntity } from "@/modules/domain/entities/document-status.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { GetAllDocumentStatusUseCase } from "../useCases/document-status/get-all-document-status.usecase";
import type { DocumentStatusService } from "../ports/input/document-status.service";

export class DocumentStatusServiceImpl implements DocumentStatusService {

  private readonly getDocumentStatusUseCase: GetAllDocumentStatusUseCase;

  constructor(private readonly documentStatusRepository: DocumentStatusRepository) {
    this.getDocumentStatusUseCase = new GetAllDocumentStatusUseCase(documentStatusRepository);
  }

  async getAllDocumentStatus(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DocumentStatusEntity>> {
    return await this.documentStatusRepository.findAll(params, includeDeleted);
  }


}
