import type { BudGetItemDetailsEntity } from "@/modules/domain/entities/budget/budget-item-details.entities";
import type {
  CreateBudgetItemDetailsDTO,
  UpdateBudgetItemDetailsDTO,
} from "@/modules/application/dtos/budget/budget-item-details.dto";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface BudgetItemDetailsService {
  createBudgetItemDetails(
    createBudgetItemDetailsDTO: CreateBudgetItemDetailsDTO
  ): Promise<BudGetItemDetailsEntity>;
  getBudgetItemDetailsById(id: string): Promise<BudGetItemDetailsEntity | null>;
  getAllBudgetItemDetails(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BudGetItemDetailsEntity>>;

  getBudgetItemDetailsByItemId(
    itemId: string,
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<BudGetItemDetailsEntity>>;

  updateBudgetItemDetails(
    id: string,
    updateUnitDTO: UpdateBudgetItemDetailsDTO
  ): Promise<BudGetItemDetailsEntity>;
  deleteBudgetItemDetails(id: string): Promise<boolean>;
}
