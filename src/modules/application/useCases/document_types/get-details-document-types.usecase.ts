import type { DocumentTypeRepository } from "@/modules/domain/repository/document-type.repository";
import type { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";

export class GetDocumentsTypeByIdUseCase {
  constructor(private readonly documentTypeRepository: DocumentTypeRepository) {}

  async execute(id: string): Promise<DocumentTypeEntity | null> {
    return await this.documentTypeRepository.findById(id);
  }
}
