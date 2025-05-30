import type { BudgetApprovalRuleEntity } from "@/modules/domain/entities/budget-approval-rules/budget-approver-rules.entity";
import type { BudgetApprovalRuleRepository } from "@/modules/domain/repository/budget-approval-rules/budget-approval-rules.repository";
import type { UpdateBudgetApprovalRuleDTO } from "../../dtos/budget-approval-rules/budget-approval-rules.repository";

export class UpdateBudgetApprovalRuleUseCase {
  constructor(private readonly budgetApvRuleRepo: BudgetApprovalRuleRepository) {}
  async execute(id: string, input: UpdateBudgetApprovalRuleDTO): Promise<BudgetApprovalRuleEntity> {
    const res = await this.budgetApvRuleRepo.findById(id);
    if (!res) {
      throw new Error(`Unit with id ${id} not found`);
    }
    res.updated(input.department_id, input.approver_id, input.min_amount.toString(), input.max_amount.toString());
    return await this.budgetApvRuleRepo.update(id, res);
  }
}
