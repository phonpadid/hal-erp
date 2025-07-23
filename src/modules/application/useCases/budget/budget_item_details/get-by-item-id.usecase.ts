import type { BudgetItemDetailsRepository } from "@/modules/domain/repository/budget/budget-item-details.repository";
import type { BudGetItemDetailsEntity } from "@/modules/domain/entities/budget/budget-item-details.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetBudgetItemDetailsByItemIdUseCase {
  constructor(private repository: BudgetItemDetailsRepository) {}

  async execute(
    itemId: string,
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetItemDetailsEntity>> {
    return await this.repository.findByBudgetItemId(itemId, params, includeDeleted);
  }
}
