import type { DocumentCategoryRepository } from "@/modules/domain/repository/document-category.repository";
import type { DocumentCategoryEntity } from "@/modules/domain/entities/document-category.entity";
import { ApiDocumentCategoryRepository } from "@/modules/infrastructure/api-document-category.repository";

export interface DocumentCategoryServices {
  getAllDocumentCategories(): Promise<DocumentCategoryEntity[]>;
}

export class DocumentCategoryServiceImpl implements DocumentCategoryServices {
  constructor(private readonly documentCategoryRepository: DocumentCategoryRepository) {}

  async getAllDocumentCategories(): Promise<DocumentCategoryEntity[]> {
    return await this.documentCategoryRepository.findAll();
  }
}

export const createDocumentCategoryService = () => {
  const documentCategoryRepository = new ApiDocumentCategoryRepository();
  return new DocumentCategoryServiceImpl(documentCategoryRepository);
};
