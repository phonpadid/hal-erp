import type { BudgetAccountsRepository } from "@/modules/domain/repository/budget/budget-accounts.repository";
import type { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";

export class GetBudgetAaccountsByIdUseCase {
  constructor(private readonly budGetRepository: BudgetAccountsRepository) {}

  async execute(id: string): Promise<BudGetAccountsEntity | null> {
    return await this.budGetRepository.findById(id);
  }
}
