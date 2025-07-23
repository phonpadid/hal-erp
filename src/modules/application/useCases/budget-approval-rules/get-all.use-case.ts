
import type { BudgetApprovalRuleEntity } from "@/modules/domain/entities/budget-approval-rules/budget-approver-rules.entity";
import type { BudgetApprovalRuleRepository } from "@/modules/domain/repository/budget-approval-rules/budget-approval-rules.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllBudgetApprovalRuleUseCase {
  constructor(private readonly budgetApvRule: BudgetApprovalRuleRepository) {}

  async execute(
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudgetApprovalRuleEntity>> {
    return await this.budgetApvRule.findAll(params, includeDeleted);
  }
}
