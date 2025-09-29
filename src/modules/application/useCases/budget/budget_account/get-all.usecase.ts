import type { BudgetAccountsRepository } from "@/modules/domain/repository/budget/budget-accounts.repository";
import type { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllBudGetAccountsUseCase {
  constructor(private readonly budGetRepository: BudgetAccountsRepository) {}

  async execute(
    params: PaginationParams,
    budget_account_id?: number
  ): Promise<PaginatedResult<BudGetAccountsEntity>> {
    return await this.budGetRepository.findAll(params, budget_account_id);
  }
}
