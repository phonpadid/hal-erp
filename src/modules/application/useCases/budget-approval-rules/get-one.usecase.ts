
import type { BudgetApprovalRuleEntity } from "@/modules/domain/entities/budget-approval-rules/budget-approver-rules.entity";
import type { BudgetApprovalRuleRepository } from "@/modules/domain/repository/budget-approval-rules/budget-approval-rules.repository";

export class GetOneBudgetApprovalRuleUseCase {
  constructor(private readonly budgetApvRule: BudgetApprovalRuleRepository) { }

  async execute(
    id: string
  ): Promise<BudgetApprovalRuleEntity | null> {
    return await this.budgetApvRule.findById(id);
  }
}
