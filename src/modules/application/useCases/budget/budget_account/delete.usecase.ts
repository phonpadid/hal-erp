import type { BudgetAccountsRepository } from "@/modules/domain/repository/budget/budget-accounts.repository";

export class DeleteBudgetAccountsUseCase {
  constructor(private readonly budGetRepository: BudgetAccountsRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.budGetRepository.delete(id);
  }
}
