import type { DocumentTypeCreate } from "./../../../interfaces/documenet-type.interface";
import type { DocumentTypeRepository } from "@/modules/domain/repository/document-type.repository";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";

export class CreateDocumentTypeUseCase {
  constructor(private readonly documentTypeRepository: DocumentTypeRepository) {}

  async execute(documentTypeData: DocumentTypeCreate): Promise<DocumentTypeEntity> {
    // Check if code already exists
    const existingCode = await this.documentTypeRepository.findByCode(documentTypeData.code);
    if (existingCode) {
      throw new Error(`code ${documentTypeData.code} already exists`);
    }
    return await this.documentTypeRepository.create(documentTypeData);
  }
}
