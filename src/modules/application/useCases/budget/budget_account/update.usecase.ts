import type { BudgetAccountsRepository } from "@/modules/domain/repository/budget/budget-accounts.repository";
import type { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";
import type { UpdateBudgetAccountInterface } from "@/modules/interfaces/budget/budget-account.interface";

export class UpdateBudgetAccountsUseCase {
  constructor(private readonly budGetRepository: BudgetAccountsRepository) {}

  async execute(
    id: string,
    budGetdata: UpdateBudgetAccountInterface
  ): Promise<BudGetAccountsEntity> {
    const budGet = await this.budGetRepository.findById(id);
    if (!budGet) {
      throw new Error(`Budget with id ${id} not found`);
    }
    if (budGet.isDeleted()) {
      throw new Error(`Cannot update deleted budget with id ${id}`);
    }

    return await this.budGetRepository.update(id, budGetdata);
  }
}
