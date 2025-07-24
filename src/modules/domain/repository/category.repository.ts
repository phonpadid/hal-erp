import { CategoryEntity } from "../entities/categories.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface CategoryRepository {
  create(category: CategoryEntity): Promise<CategoryEntity>;
  findById(id: string): Promise<CategoryEntity | null>;
  findByName(name: string): Promise<CategoryEntity | null>;
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<CategoryEntity>>;
  update(category: CategoryEntity): Promise<CategoryEntity>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
