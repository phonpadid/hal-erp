import type { BudgetAccountsRepository } from "@/modules/domain/repository/budget/budget-accounts.repository";

export class DeleteBudgetAccountsUseCase {
  constructor(private readonly budGetRepository: BudgetAccountsRepository) {}

  async execute(id: string): Promise<boolean> {
    // Check if budGet exists
    const budGet = await this.budGetRepository.findById(id);
    if (!budGet) {
      throw new Error(`budGet with id ${id} not found`);
    }

    // Check if budGet is already deleted
    if (budGet.isDeleted()) {
      throw new Error(`budGet with id ${id} is already deleted`);
    }

    // Delete budGet
    return await this.budGetRepository.delete(id);
  }
}
