
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { BudgetApprovalRulesInput } from "../../ports/input/budget-approval-rules/budget-approval-rule-input";
import { CreateBudgetApprovalRuleUseCase } from "../../useCases/budget-approval-rules/create.use-case";
import { UpdateBudgetApprovalRuleUseCase } from "../../useCases/budget-approval-rules/update.use-case";
import { DeleteBudgetApprovalRuleUseCase } from "../../useCases/budget-approval-rules/delete.use-case";
import { GetOneBudgetApprovalRuleUseCase } from "../../useCases/budget-approval-rules/get-one.usecase";
import type { BudgetApprovalRuleRepository } from "@/modules/domain/repository/budget-approval-rules/budget-approval-rules.repository";
import type { CreateBudgetApprovalRuleDTO, UpdateBudgetApprovalRuleDTO } from "../../dtos/budget-approval-rules/budget-approval-rules.repository";
import type { BudgetApprovalRuleEntity } from "@/modules/domain/entities/budget-approval-rules/budget-approver-rules.entity";
import { GetAllBudgetApprovalRuleUseCase } from "../../useCases/budget-approval-rules/get-all.use-case";

export class BudgetApprovalRuleServiceImpl implements BudgetApprovalRulesInput {
  private readonly createUseCase: CreateBudgetApprovalRuleUseCase;
  private readonly updateUseCase: UpdateBudgetApprovalRuleUseCase
  private readonly deleteUseCase: DeleteBudgetApprovalRuleUseCase;
  private readonly getOneUseCase: GetOneBudgetApprovalRuleUseCase;
  private readonly getAllUseCase: GetAllBudgetApprovalRuleUseCase;

  constructor(budgetApvRuleRepository: BudgetApprovalRuleRepository) {
    this.createUseCase = new CreateBudgetApprovalRuleUseCase(budgetApvRuleRepository);
    this.updateUseCase = new UpdateBudgetApprovalRuleUseCase(budgetApvRuleRepository);
    this.deleteUseCase = new DeleteBudgetApprovalRuleUseCase(budgetApvRuleRepository);
    this.getOneUseCase = new GetOneBudgetApprovalRuleUseCase(budgetApvRuleRepository);
    this.getAllUseCase = new GetAllBudgetApprovalRuleUseCase(budgetApvRuleRepository);
  }
  async create(input: CreateBudgetApprovalRuleDTO): Promise<BudgetApprovalRuleEntity> {
    return await this.createUseCase.execute(input);
  }

  async getById(id: string): Promise<BudgetApprovalRuleEntity | null> {
    return await this.getOneUseCase.execute(id);
  }

  async getAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudgetApprovalRuleEntity>> {
    return await this.getAllUseCase.execute(params, includeDeleted);
  }

  async update(id: string, input: UpdateBudgetApprovalRuleDTO): Promise<BudgetApprovalRuleEntity> {

    return await this.updateUseCase.execute(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.deleteUseCase.execute(id);
  }

}
