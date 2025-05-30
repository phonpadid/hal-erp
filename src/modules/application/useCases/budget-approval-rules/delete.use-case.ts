import type { BudgetApprovalRuleRepository } from "@/modules/domain/repository/budget-approval-rules/budget-approval-rules.repository";

export class DeleteBudgetApprovalRuleUseCase {
  constructor(private readonly BudgetApvRuleRepository: BudgetApprovalRuleRepository) {}

  async execute(id: string): Promise<boolean> {
    const res = await this.BudgetApvRuleRepository.findById(id);
    if (!res) {
      throw new Error(`budget with id ${id} not found`);
    }
    if (res.isDeleted()) {
      throw new Error(`budget with id ${id} is already deleted`);
    }
    return await this.BudgetApvRuleRepository.delete(id);
  }
}
