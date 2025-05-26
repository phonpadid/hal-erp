import type { DocumentTypeEntity } from "../../../domain/entities/document-type.entities";
import type { CreateDocumentTypeDTO, UpdateDocumentTypeDTO } from "../../dtos/documenet-type.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface DocumentTypeService {
  createDocumentType(createDocumentType: CreateDocumentTypeDTO): Promise<DocumentTypeEntity>;
  getDocumentTypeById(id: string): Promise<DocumentTypeEntity | null>;
  getDocumentTypeByName(name: string): Promise<DocumentTypeEntity | null>;
  getAllDocumentType(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<DocumentTypeEntity>>;
  updateDocumentType(
    id: string,
    updateDocumentType: UpdateDocumentTypeDTO
  ): Promise<DocumentTypeEntity>;
  deleteDocumentType(id: string): Promise<boolean>;
}
