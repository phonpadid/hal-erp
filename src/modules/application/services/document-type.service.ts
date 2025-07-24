import type {
  DocumentTypeCreate,
  DocumentTypeUpdate,
} from "./../../interfaces/documenet-type.interface";
import type { DocumentTypeRepository } from "@/modules/domain/repository/document-type.repository";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface DocumentTypeServices {
  getAllDocumentTypes(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<DocumentTypeEntity>>;
  getDocumentTypeById(id: string): Promise<DocumentTypeEntity | null>;
  createDocumentType(documentTypeData: DocumentTypeCreate): Promise<DocumentTypeEntity>;
  updateDocumentType(id: string, documentTypeData: DocumentTypeUpdate): Promise<DocumentTypeEntity>;
  deleteDocumentType(id: string): Promise<boolean>;
}

export class DocumentTypeServiceImpl implements DocumentTypeServices {
  constructor(private readonly documentTypeRepository: DocumentTypeRepository) {}
  async getAllDocumentTypes(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DocumentTypeEntity>> {
    return await this.documentTypeRepository.findAll(params, includeDeleted);
  }

  async getDocumentTypeById(id: string): Promise<DocumentTypeEntity | null> {
    return await this.documentTypeRepository.findById(id);
  }

  async createDocumentType(documentTypeData: DocumentTypeCreate): Promise<DocumentTypeEntity> {
    return await this.documentTypeRepository.create(documentTypeData);
  }

  async updateDocumentType(
    id: string,
    documentTypeData: DocumentTypeUpdate
  ): Promise<DocumentTypeEntity> {
    return await this.documentTypeRepository.update(id, documentTypeData);
  }

  async deleteDocumentType(id: string): Promise<boolean> {
    const documentType = await this.documentTypeRepository.findById(id);
    if (!documentType) {
      throw new Error(`Document type with id ${id} not found`);
    }
    if (documentType.isDeleted()) {
      throw new Error(`Document type with id ${id} is already deleted`);
    }

    return await this.documentTypeRepository.delete(id);
  }
}
