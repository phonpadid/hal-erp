import type { IncreaseBudgetAccountCreateDTO, IncreaseBudgetAccountUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-budget.dto";
import type { IncreaseBudGetAccountsEntity } from "@/modules/domain/entities/budget/increase/increase-budget.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface IncreaseBudgetRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<IncreaseBudGetAccountsEntity>>;
  findById(id: string): Promise<IncreaseBudGetAccountsEntity | null>;
  create(input: IncreaseBudgetAccountCreateDTO): Promise<IncreaseBudGetAccountsEntity>;
  update(id: string, input: IncreaseBudgetAccountUpdateDTO): Promise<IncreaseBudGetAccountsEntity>;
  delete(id: string): Promise<boolean>;
}
