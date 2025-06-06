import type { BudgetItemRepository } from "@/modules/domain/repository/budget/budget-item.repository";
import type { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetBudgetItemsByAccountIdUseCase {
  constructor(private repository: BudgetItemRepository) {}

  async execute(
    budgetAccountId: string,
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetItemEntity>> {
    return await this.repository.findByBudgetAccountId(budgetAccountId, params, includeDeleted);
  }
}
