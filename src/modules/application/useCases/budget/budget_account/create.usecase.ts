import type { CreateBudgetAccountInterface } from "@/modules/interfaces/budget/budget-account.interface";
import type { BudgetAccountsRepository } from "@/modules/domain/repository/budget/budget-accounts.repository";
import type { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";

export class CreateBudgetAccountUseCase {
  constructor(private readonly BudGetAccountsRepository: BudgetAccountsRepository) {}

  async execute(budGetdata: CreateBudgetAccountInterface): Promise<BudGetAccountsEntity> {
    return await this.BudGetAccountsRepository.create(budGetdata);
  }
}
