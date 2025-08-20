import type { IncreaseBudgetAccountDetailCreateDTO, IncreaseBudgetAccountDetailUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-detail.dto";
import type { IcraseDetailEntity } from "@/modules/domain/entities/budget/increase/increase-detail.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface IncreaseBudgetItemRepository {
  findAll(
    id: string,
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<IcraseDetailEntity>>;
  findById(id: string): Promise<IcraseDetailEntity | null>;
  create(id: number, input: IncreaseBudgetAccountDetailCreateDTO): Promise<IcraseDetailEntity>;
  update(id: string, input: IncreaseBudgetAccountDetailUpdateDTO): Promise<IcraseDetailEntity>;
  delete(id: string): Promise<boolean>;
}
