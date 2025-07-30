import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { DocumentTypeCreate, DocumentTypeUpdate } from "../../interfaces/documenet-type.interface";

export interface DocumentTypeRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<DocumentTypeEntity>>;
  findById(id: string): Promise<DocumentTypeEntity | null>;
  findByCode(code: string): Promise<DocumentTypeEntity | null>;
  create(data: DocumentTypeCreate): Promise<DocumentTypeEntity>;
  update(id: string, data: DocumentTypeUpdate): Promise<DocumentTypeEntity>;
  delete(id: string): Promise<boolean>;
}
