import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { IncreaseBudgetService } from "@/modules/application/ports/input/budget/increase-budget/increase-budget.service";
import type { IncreaseBudgetRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget.repository";
import { CreateIncreaseBudgetUseCase } from "@/modules/application/useCases/budget/increase-budget/increase/create.usecase";
import { UpdateIncreaseBudgetUseCase } from "@/modules/application/useCases/budget/increase-budget/increase/update.usecase";
import { DeleteIncreaseBudgetUseCase } from "@/modules/application/useCases/budget/increase-budget/increase/delete.usecase";
import { GetIncreaseBudgetByIdUseCase } from "@/modules/application/useCases/budget/increase-budget/increase/get-one.usecase";
import { GetAllIncreaseBudGetUseCase } from "@/modules/application/useCases/budget/increase-budget/increase/get-all.usecase";
import type { IncreaseBudGetAccountsEntity } from "@/modules/domain/entities/budget/increase/increase-budget.entity";
import type { IncreaseBudgetAccountCreateDTO, IncreaseBudgetAccountUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-budget.dto";

export class IncreaseBudgetServiceImpl implements IncreaseBudgetService {
  private readonly createUseCase: CreateIncreaseBudgetUseCase;
  private readonly updateUseCase: UpdateIncreaseBudgetUseCase;
  private readonly deleteUseCase: DeleteIncreaseBudgetUseCase;
  private readonly getOneUseCase: GetIncreaseBudgetByIdUseCase;
  private readonly getAllUseCase: GetAllIncreaseBudGetUseCase;

  constructor(repo: IncreaseBudgetRepository) {
    this.createUseCase = new CreateIncreaseBudgetUseCase(repo);
    this.updateUseCase = new UpdateIncreaseBudgetUseCase(repo);
    this.deleteUseCase = new DeleteIncreaseBudgetUseCase(repo);
    this.getOneUseCase = new GetIncreaseBudgetByIdUseCase(repo);
    this.getAllUseCase = new GetAllIncreaseBudGetUseCase(repo);
  }
  async create(input: IncreaseBudgetAccountCreateDTO): Promise<IncreaseBudGetAccountsEntity> {
    return await this.createUseCase.execute(input);
  }

  async getById(id: string): Promise<IncreaseBudGetAccountsEntity | null> {
    return await this.getOneUseCase.execute(id);
  }

  async getAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<IncreaseBudGetAccountsEntity>> {
    return await this.getAllUseCase.execute(params, includeDeleted);
  }

  async update(id: string, input: IncreaseBudgetAccountUpdateDTO): Promise<IncreaseBudGetAccountsEntity> {
    return await this.updateUseCase.execute(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.deleteUseCase.execute(id);
  }
}
