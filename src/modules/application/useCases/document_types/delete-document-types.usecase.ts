import type { DocumentTypeRepository } from "@/modules/domain/repository/document-type.repository";

export class DeleteDocumentsUseCase {
  constructor(private readonly documentTypeRepository: DocumentTypeRepository) {}

  async execute(id: string): Promise<boolean> {
    const user = await this.documentTypeRepository.findById(id);
    if (!user) {
      throw new Error(`documentTypeRepository with id ${id} not found`);
    }
    if (user.isDeleted()) {
      throw new Error(`documentTypeRepository with id ${id} is already deleted`);
    }
    return await this.documentTypeRepository.delete(id);
  }
}
