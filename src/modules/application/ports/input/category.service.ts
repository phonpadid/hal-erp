import type { CategoryEntity } from "../../../domain/entities/categories.entity";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "../../dtos/category.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface CategoryService {
  createCategory(createCategoryDTO: CreateCategoryDTO): Promise<CategoryEntity>;
  getCategoryById(id: string): Promise<CategoryEntity | null>;
  getCategoryByName(name: string): Promise<CategoryEntity | null>;
  getAllCategories(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<CategoryEntity>>;
  updateCategory(id: string, updateCategoryDTO: UpdateCategoryDTO): Promise<CategoryEntity>;
  deleteCategory(id: string): Promise<boolean>;
  restoreCategory(id: string): Promise<boolean>;
}
