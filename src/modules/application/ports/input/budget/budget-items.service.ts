import type { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";
import type {
  CreateBudgetItemDTO,
  UpdateBudgetItemDTO,
} from "@/modules/application/dtos/budget/budget-items.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BudgetItemService {
  createBudgetItem(createBudgetItemDTO: CreateBudgetItemDTO): Promise<BudGetItemEntity>;
  getBudgetItemById(id: string): Promise<BudGetItemEntity | null>;

  getAllBudgetItem(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BudGetItemEntity>>;
  getAllReportBudgetItem(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BudGetItemEntity>>;
  getBudgetItemsByAccountId(
    budgetAccountId: string,
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BudGetItemEntity>>;

  updateBudgetItem(id: string, updateBudgetItemDTO: UpdateBudgetItemDTO): Promise<BudGetItemEntity>;
  deleteBudgetItem(id: string): Promise<boolean>;
}
