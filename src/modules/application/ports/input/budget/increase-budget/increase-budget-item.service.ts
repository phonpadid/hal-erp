import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { IncreaseBudgetAccountDetailCreateDTO, IncreaseBudgetAccountDetailUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-detail.dto";
import type { IcraseDetailEntity } from "@/modules/domain/entities/budget/increase/increase-detail.entity";

export interface IncreaseBudgetItemService {
  create(
    id: number,
    input: IncreaseBudgetAccountDetailCreateDTO
  ): Promise<IcraseDetailEntity>;
  getById(id: string): Promise<IcraseDetailEntity | null>;
  getAll(
    id: string,
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<IcraseDetailEntity>>;
  update(
    id: string,
    input: IncreaseBudgetAccountDetailUpdateDTO
  ): Promise<IcraseDetailEntity>;
  delete(id: string): Promise<boolean>;
}
