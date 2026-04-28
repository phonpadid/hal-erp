import type { DocumentCategoryEntity } from "@/modules/domain/entities/document-category.entity";

export interface DocumentCategoryRepository {
  findAll(): Promise<DocumentCategoryEntity[]>;
}
