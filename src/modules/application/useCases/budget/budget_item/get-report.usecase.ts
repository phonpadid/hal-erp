import type { BudgetItemRepository } from "@/modules/domain/repository/budget/budget-item.repository";
import type { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetReportBudgetItemUseCase {
  constructor(private readonly budGetRepository: BudgetItemRepository) {}
  async report(
    params: PaginationParams,
    budgetType: string,
    departmentId?: number
  ): Promise<PaginatedResult<BudGetItemEntity>> {
    return await this.budGetRepository.getReport(params, budgetType, departmentId);
  }
}
