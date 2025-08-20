import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { IncreaseBudGetAccountsEntity } from "@/modules/domain/entities/budget/increase/increase-budget.entity";
import type { IncreaseBudgetAccountCreateDTO, IncreaseBudgetAccountUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-budget.dto";

export interface IncreaseBudgetService {
  create(
    input: IncreaseBudgetAccountCreateDTO
  ): Promise<IncreaseBudGetAccountsEntity>;
  getById(id: string): Promise<IncreaseBudGetAccountsEntity | null>;
  getAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<IncreaseBudGetAccountsEntity>>;
  update(
    id: string,
    input: IncreaseBudgetAccountUpdateDTO
  ): Promise<IncreaseBudGetAccountsEntity>;
  delete(id: string): Promise<boolean>;
}
