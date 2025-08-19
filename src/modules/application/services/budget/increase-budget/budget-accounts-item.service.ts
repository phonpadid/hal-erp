import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { IncreaseBudgetItemService } from "@/modules/application/ports/input/budget/increase-budget/increase-budget-item.service";
import { CreateIncreaseBudgetItemUseCase } from "@/modules/application/useCases/budget/increase-budget/increase-detail/create.usecase";
import { UpdateIncreaseBudgetItemUseCase } from "@/modules/application/useCases/budget/increase-budget/increase-detail/update.usecase";
import { DeleteIncreaseBudgetItemUseCase } from "@/modules/application/useCases/budget/increase-budget/increase-detail/delete.usecase";
import { GetAllIncreaseBudGetItemUseCase } from "@/modules/application/useCases/budget/increase-budget/increase-detail/get-all.usecase";
import type { IncreaseBudgetItemRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget-item.repository";
import { GetIncreaseBudgetItemByIdUseCase } from "@/modules/application/useCases/budget/increase-budget/increase-detail/get-one.usecase";
import type { IncreaseBudgetAccountDetailCreateDTO, IncreaseBudgetAccountDetailUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-detail.dto";
import type { IcraseDetailEntity } from "@/modules/domain/entities/budget/increase/increase-detail.entity";

export class IncreaseBudgetItemServiceImpl implements IncreaseBudgetItemService {
  private readonly createUseCase: CreateIncreaseBudgetItemUseCase;
  private readonly updateUseCase: UpdateIncreaseBudgetItemUseCase;
  private readonly deleteUseCase: DeleteIncreaseBudgetItemUseCase;
  private readonly getOneUseCase: GetIncreaseBudgetItemByIdUseCase;
  private readonly getAllUseCase: GetAllIncreaseBudGetItemUseCase;

  constructor(repo: IncreaseBudgetItemRepository) {
    this.createUseCase = new CreateIncreaseBudgetItemUseCase(repo);
    this.updateUseCase = new UpdateIncreaseBudgetItemUseCase(repo);
    this.deleteUseCase = new DeleteIncreaseBudgetItemUseCase(repo);
    this.getOneUseCase = new GetIncreaseBudgetItemByIdUseCase(repo);
    this.getAllUseCase = new GetAllIncreaseBudGetItemUseCase(repo);
  }
  async create(id: number, input: IncreaseBudgetAccountDetailCreateDTO): Promise<IcraseDetailEntity> {
    return await this.createUseCase.execute(id, input);
  }

  async getById(id: string): Promise<IcraseDetailEntity | null> {
    return await this.getOneUseCase.execute(id);
  }

  async getAll(
    id: string,
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<IcraseDetailEntity>> {
    return await this.getAllUseCase.execute(id, params, includeDeleted);
  }

  async update(id: string, input: IncreaseBudgetAccountDetailUpdateDTO): Promise<IcraseDetailEntity> {
    return await this.updateUseCase.execute(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.deleteUseCase.execute(id);
  }
}
