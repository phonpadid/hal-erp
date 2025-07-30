import type { CategoryEntity } from "../entities/categories.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "@/modules/application/dtos/category.dto";

export interface CategoryRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<CategoryEntity>>;
  findById(id: string): Promise<CategoryEntity | null>;
  findByName(name: string): Promise<CategoryEntity | null>;
  create(data: CreateCategoryDTO): Promise<CategoryEntity>;
  update(id: string, data: UpdateCategoryDTO): Promise<CategoryEntity>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
