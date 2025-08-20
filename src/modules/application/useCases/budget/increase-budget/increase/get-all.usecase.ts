import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { IncreaseBudgetRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget.repository";
import type { IncreaseBudGetAccountsEntity } from "@/modules/domain/entities/budget/increase/increase-budget.entity";

export class GetAllIncreaseBudGetUseCase {
  constructor(private readonly repo: IncreaseBudgetRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<IncreaseBudGetAccountsEntity>> {
    return await this.repo.findAll(params, includeDeleted);
  }
}
