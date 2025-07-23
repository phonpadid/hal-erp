import type { BudgetItemDetailsRepository } from "@/modules/domain/repository/budget/budget-item-details.repository";
import type { BudGetItemDetailsEntity } from "@/modules/domain/entities/budget/budget-item-details.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllBudGetItemDetailsUseCase {
  constructor(private readonly budGetRepository: BudgetItemDetailsRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetItemDetailsEntity>> {
    return await this.budGetRepository.findAll(params, includeDeleted);
  }
}
