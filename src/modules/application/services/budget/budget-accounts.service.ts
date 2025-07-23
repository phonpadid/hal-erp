import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { BudgetAccountsService } from "../../ports/input/budget/budget-accounts.service";
import { CreateBudgetAccountUseCase } from "../../useCases/budget/budget_account/create.usecase";
import { UpdateBudgetAccountsUseCase } from "../../useCases/budget/budget_account/update.usecase";
import { DeleteBudgetAccountsUseCase } from "../../useCases/budget/budget_account/delete.usecase";
import { GetBudgetAaccountsByIdUseCase } from "../../useCases/budget/budget_account/get-one.usecase";
import { GetAllBudGetAccountsUseCase } from "../../useCases/budget/budget_account/get-all.usecase";
import type { BudgetAccountsRepository } from "@/modules/domain/repository/budget/budget-accounts.repository";
import type {
  CreateBudgetAccountDTO,
  UpdateBudgetAccountDTO,
} from "../../dtos/budget/budget-accounts.dto";
import type { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";

export class BudgetAccountServiceImpl implements BudgetAccountsService {
  private readonly createUseCase: CreateBudgetAccountUseCase;
  private readonly updateUseCase: UpdateBudgetAccountsUseCase;
  private readonly deleteUseCase: DeleteBudgetAccountsUseCase;
  private readonly getOneUseCase: GetBudgetAaccountsByIdUseCase;
  private readonly getAllUseCase: GetAllBudGetAccountsUseCase;

  constructor(budGetAccounts: BudgetAccountsRepository) {
    this.createUseCase = new CreateBudgetAccountUseCase(budGetAccounts);
    this.updateUseCase = new UpdateBudgetAccountsUseCase(budGetAccounts);
    this.deleteUseCase = new DeleteBudgetAccountsUseCase(budGetAccounts);
    this.getOneUseCase = new GetBudgetAaccountsByIdUseCase(budGetAccounts);
    this.getAllUseCase = new GetAllBudGetAccountsUseCase(budGetAccounts);
  }
  async createBudgetAccounts(input: CreateBudgetAccountDTO): Promise<BudGetAccountsEntity> {
    return await this.createUseCase.execute(input);
  }

  async getBudgetAccountsById(id: string): Promise<BudGetAccountsEntity | null> {
    return await this.getOneUseCase.execute(id);
  }

  async getAllBudgetAccounts(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetAccountsEntity>> {
    return await this.getAllUseCase.execute(params, includeDeleted);
  }

  async updateBudgetAccounts(id: string, input: UpdateBudgetAccountDTO): Promise<BudGetAccountsEntity> {
    return await this.updateUseCase.execute(id, input);
  }

  async deleteBudgetAccounts(id: string): Promise<boolean> {
    return await this.deleteUseCase.execute(id);
  }
}
