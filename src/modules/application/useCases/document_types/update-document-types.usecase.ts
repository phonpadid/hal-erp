import type { DocumentTypeRepository } from "@/modules/domain/repository/document-type.repository";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";
import type { DocumentTypeUpdate } from "@/modules/interfaces/documenet-type.interface";

export class UpdateDocumentsTypeUseCase {
  constructor(private readonly DocumentTypeRepository: DocumentTypeRepository) {}

  async execute(id: string, documentTypeData: DocumentTypeUpdate): Promise<DocumentTypeEntity> {
    // Check if documentsType exists
    const documentsType = await this.DocumentTypeRepository.findById(id);
    if (!documentsType) {
      throw new Error(`documentsType with id ${id} not found`);
    }
    if (documentsType.isDeleted()) {
      throw new Error(`Cannot update deleted documentsType with id ${id}`);
    }
    if (documentTypeData.code && documentTypeData.code !== documentsType.getcode()) {
      const existingcode = await this.DocumentTypeRepository.findByCode(documentTypeData.code);
      if (existingcode && existingcode.getId() !== id) {
        throw new Error(`code ${documentTypeData.code} already exists`);
      }
    }
    return await this.DocumentTypeRepository.update(id, documentTypeData);
  }
}
