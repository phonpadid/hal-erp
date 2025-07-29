import type { BudgetItemDetailsRepository } from "@/modules/domain/repository/budget/budget-item-details.repository";

export class DeleteBudgetItemDetailsUseCase {
  constructor(private readonly budGetRepository: BudgetItemDetailsRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.budGetRepository.delete(id);
  }
}
