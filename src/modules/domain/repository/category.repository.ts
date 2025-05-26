import { Category } from "../entities/categories.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface CategoryRepository {
  create(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Category>>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
