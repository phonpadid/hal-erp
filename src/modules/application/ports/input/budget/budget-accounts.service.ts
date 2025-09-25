import type { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";
import type {
  CreateBudgetAccountDTO,
  UpdateBudgetAccountDTO,
} from "@/modules/application/dtos/budget/budget-accounts.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BudgetAccountsService {
  createBudgetAccounts(
    createBudgetAccountsDTO: CreateBudgetAccountDTO
  ): Promise<BudGetAccountsEntity>;
  getBudgetAccountsById(id: string): Promise<BudGetAccountsEntity | null>;
  getAllBudgetAccounts(
    params: PaginationParams,
    budget_account_id: number
  ): Promise<PaginatedResult<BudGetAccountsEntity>>;
  updateBudgetAccounts(
    id: string,
    updateUnitDTO: UpdateBudgetAccountDTO
  ): Promise<BudGetAccountsEntity>;
  deleteBudgetAccounts(id: string): Promise<boolean>;
}
