import type {
  CreateBudgetItemInterface,
  UpdateBudgetItemInterface,
} from "@/modules/interfaces/budget/budget-item.interface";
import type { BudGetItemEntity } from "../../entities/budget/budget-items.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BudgetItemRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BudGetItemEntity>>;
  findById(id: string): Promise<BudGetItemEntity | null>;
  findByBudgetAccountId(
    budgetAccountId: string,
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BudGetItemEntity>>;
  create(budgetData: CreateBudgetItemInterface): Promise<BudGetItemEntity>;
  update(id: string, budget: UpdateBudgetItemInterface): Promise<BudGetItemEntity>;
  delete(id: string): Promise<boolean>;
}
