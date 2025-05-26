import type { Category } from "../../../domain/entities/categories.entities";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "../../dtos/category.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface CategoryService {
  createCategory(createCategoryDTO: CreateCategoryDTO): Promise<Category>;
  getCategoryById(id: string): Promise<Category | null>;
  getCategoryByName(name: string): Promise<Category | null>;
  getAllCategories(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Category>>;
  updateCategory(id: string, updateCategoryDTO: UpdateCategoryDTO): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  restoreCategory(id: string): Promise<boolean>;
}
