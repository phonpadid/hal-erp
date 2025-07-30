import type { CategoryEntity } from "@/modules/domain/entities/categories.entity";
import type { CategoryRepository } from "@/modules/domain/repository/category.repository";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";

export class GetAllCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CategoryEntity>> {
    return await this.categoryRepository.findAll(params, includeDeleted);
  }
}
