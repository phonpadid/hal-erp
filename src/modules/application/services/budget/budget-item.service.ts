import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { BudgetItemService } from "../../ports/input/budget/budget-items.service";
import { CreateBudgetItemUseCase } from "../../useCases/budget/budget_item/create.usecase";
import { UpdateBudgetItemDetailsUseCase } from "../../useCases/budget/budget_item/update.usecase";
import { DeleteBudgetItemUseCase } from "../../useCases/budget/budget_item/delete.usecase";
import { GetBudgetItemByIdUseCase } from "../../useCases/budget/budget_item/get-one.usecase";
import { GetAllBudGetItemUseCase } from "../../useCases/budget/budget_item/get-all.usecase";
import { GetBudgetItemsByAccountIdUseCase } from "../../useCases/budget/budget_item/get-items-by-account.usecase";
import type { BudgetItemRepository } from "@/modules/domain/repository/budget/budget-item.repository";
import type { CreateBudgetItemDTO, UpdateBudgetItemDTO } from "../../dtos/budget/budget-items.dto";
import type { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";

export class BudgetItemDetailsServiceImpl implements BudgetItemService {
  private readonly createUseCase: CreateBudgetItemUseCase;
  private readonly updateUseCase: UpdateBudgetItemDetailsUseCase;
  private readonly deleteUseCase: DeleteBudgetItemUseCase;
  private readonly getOneUseCase: GetBudgetItemByIdUseCase;
  private readonly getAllUseCase: GetAllBudGetItemUseCase;
  private readonly getByAccountIdUseCase: GetBudgetItemsByAccountIdUseCase;

  constructor(budgetItemRepository: BudgetItemRepository) {
    this.createUseCase = new CreateBudgetItemUseCase(budgetItemRepository);
    this.updateUseCase = new UpdateBudgetItemDetailsUseCase(budgetItemRepository);
    this.deleteUseCase = new DeleteBudgetItemUseCase(budgetItemRepository);
    this.getOneUseCase = new GetBudgetItemByIdUseCase(budgetItemRepository);
    this.getAllUseCase = new GetAllBudGetItemUseCase(budgetItemRepository);
    this.getByAccountIdUseCase = new GetBudgetItemsByAccountIdUseCase(budgetItemRepository);
  }

  async createBudgetItem(input: CreateBudgetItemDTO): Promise<BudGetItemEntity> {
    return await this.createUseCase.execute(input);
  }

  async getBudgetItemById(id: string): Promise<BudGetItemEntity | null> {
    return await this.getOneUseCase.execute(id);
  }

  async getAllBudgetItem(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetItemEntity>> {
    return await this.getAllUseCase.execute(params, includeDeleted);
  }

  // เพิ่มเมธอดใหม่
  async getBudgetItemsByAccountId(
    budgetAccountId: string,
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetItemEntity>> {
    return await this.getByAccountIdUseCase.execute(budgetAccountId, params, includeDeleted);
  }

  async updateBudgetItem(id: string, input: UpdateBudgetItemDTO): Promise<BudGetItemEntity> {
    return await this.updateUseCase.execute(id, input);
  }

  async deleteBudgetItem(id: string): Promise<boolean> {
    return await this.deleteUseCase.execute(id);
  }
}
