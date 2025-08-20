import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { IncreaseBudgetItemRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget-item.repository";
import type { IcraseDetailEntity } from "@/modules/domain/entities/budget/increase/increase-detail.entity";

export class GetAllIncreaseBudGetItemUseCase {
  constructor(private readonly repo: IncreaseBudgetItemRepository) {}

  async execute(
    id: string,
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<IcraseDetailEntity>> {
    return await this.repo.findAll(id, params, includeDeleted);
  }
}
