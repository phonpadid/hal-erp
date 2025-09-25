import type { BudgetItemRepository } from "@/modules/domain/repository/budget/budget-item.repository";
import type { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllBudGetItemUseCase {
  constructor(private readonly budGetRepository: BudgetItemRepository) {}

  async execute(
    params: PaginationParams,
    budget_account_id?: number | string,
  ): Promise<PaginatedResult<BudGetItemEntity>> {
    return await this.budGetRepository.findAll(params, budget_account_id);
  }
}
