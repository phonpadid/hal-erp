import type {
  CreateBudgetItemDetailsInterface,
  UpdateBudgetItemDetailsInterface,
} from "@/modules/interfaces/budget/budget-item-details.interface";
import type { BudGetItemDetailsEntity } from "../../entities/budget/budget-item-details.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BudgetItemDetailsRepository {
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BudGetItemDetailsEntity>>;
  findById(id: string): Promise<BudGetItemDetailsEntity | null>;
  create(budgetData: CreateBudgetItemDetailsInterface): Promise<BudGetItemDetailsEntity>;
  update(
    id: string,
    budget: UpdateBudgetItemDetailsInterface
  ): Promise<BudGetItemDetailsEntity>;
  delete(id: string): Promise<boolean>;
}
