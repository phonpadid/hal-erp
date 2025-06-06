import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { BudgetItemDeatilsService } from "../../ports/input/budget/budget-item-details.service";
import { CreateBudgetItemDetailsUseCase } from "../../useCases/budget/budget_item_details/create.usecase";
import { UpdateBudgetItemDetailsUseCase } from "../../useCases/budget/budget_item_details/update.usecase";
import { DeleteBudgetItemDetailsUseCase } from "../../useCases/budget/budget_item_details/delete.usecase";
import { GetBudgetItemDetailsByIdUseCase } from "../../useCases/budget/budget_item_details/get-one.usecase";
import { GetAllBudGetItemDetailsUseCase } from "../../useCases/budget/budget_item_details/get-all.usecase";
import type { BudgetItemDetailsRepository } from "@/modules/domain/repository/budget/budget-item-details.repository";
import type {
  CreateBudgetItemDetailsDTO,
  UpdateBudgetItemDetailsDTO,
} from "../../dtos/budget/budget-item-details.dto";
import type { BudGetItemDetailsEntity } from "@/modules/domain/entities/budget/budget-item-details.entities";

export class BudgetItemDetailsServiceImpl implements BudgetItemDeatilsService {
  private readonly createUseCase: CreateBudgetItemDetailsUseCase;
  private readonly updateUseCase: UpdateBudgetItemDetailsUseCase;
  private readonly deleteUseCase: DeleteBudgetItemDetailsUseCase;
  private readonly getOneUseCase: GetBudgetItemDetailsByIdUseCase;
  private readonly getAllUseCase: GetAllBudGetItemDetailsUseCase;

  constructor(budGetAccounts: BudgetItemDetailsRepository) {
    this.createUseCase = new CreateBudgetItemDetailsUseCase(budGetAccounts);
    this.updateUseCase = new UpdateBudgetItemDetailsUseCase(budGetAccounts);
    this.deleteUseCase = new DeleteBudgetItemDetailsUseCase(budGetAccounts);
    this.getOneUseCase = new GetBudgetItemDetailsByIdUseCase(budGetAccounts);
    this.getAllUseCase = new GetAllBudGetItemDetailsUseCase(budGetAccounts);
  }
  async createBudgetItemDetails(
    input: CreateBudgetItemDetailsDTO
  ): Promise<BudGetItemDetailsEntity> {
    return await this.createUseCase.execute(input);
  }

  async getBudgetItemDetailsById(id: string): Promise<BudGetItemDetailsEntity | null> {
    return await this.getOneUseCase.execute(id);
  }

  async getAllBudgetItemDetails(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetItemDetailsEntity>> {
    return await this.getAllUseCase.execute(params, includeDeleted);
  }

  async updateBudgetItemDetails(
    id: string,
    input: UpdateBudgetItemDetailsDTO
  ): Promise<BudGetItemDetailsEntity> {
    return await this.updateUseCase.execute(id, input);
  }

  async deleteBudgetItemDetails(id: string): Promise<boolean> {
    return await this.deleteUseCase.execute(id);
  }
}
