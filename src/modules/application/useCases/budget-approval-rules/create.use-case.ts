import type { BudgetApprovalRuleRepository } from "@/modules/domain/repository/budget-approval-rules/budget-approval-rules.repository";
import type { CreateBudgetApprovalRuleDTO } from "../../dtos/budget-approval-rules/budget-approval-rules.repository";
import { BudgetApprovalRuleEntity } from "@/modules/domain/entities/budget-approval-rules/budget-approver-rules.entity";

export class CreateBudgetApprovalRuleUseCase {
  constructor(private readonly budgetApvRulueRepo: BudgetApprovalRuleRepository) { }

  async execute(inputs: CreateBudgetApprovalRuleDTO): Promise<BudgetApprovalRuleEntity> {
    const res = BudgetApprovalRuleEntity.create(
      inputs.department_id,
      inputs.approver_id,
      inputs.min_amount.toString(),
      inputs.max_amount.toString()
    );
    return await this.budgetApvRulueRepo.create(res); // make sure repo method is also updated
  }
}
