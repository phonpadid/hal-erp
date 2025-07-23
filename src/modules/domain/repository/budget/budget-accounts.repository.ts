import type {
  CreateBudgetAccountInterface,
  UpdateBudgetAccountInterface,
} from "@/modules/interfaces/budget/budget-account.interface";
import type { BudGetAccountsEntity } from "../../entities/budget/budget-accounts.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BudgetAccountsRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BudGetAccountsEntity>>;
  findById(id: string): Promise<BudGetAccountsEntity | null>;
  create(budgetAccountData: CreateBudgetAccountInterface): Promise<BudGetAccountsEntity>;
  update(id: string, budgetAccounts: UpdateBudgetAccountInterface): Promise<BudGetAccountsEntity>;
  delete(id: string): Promise<boolean>;
}
