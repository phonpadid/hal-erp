import type { BudgetItemDetailsRepository } from "@/modules/domain/repository/budget/budget-item-details.repository";
import type { BudGetItemDetailsEntity } from "@/modules/domain/entities/budget/budget-item-details.entities";

export class GetBudgetItemDetailsByIdUseCase {
  constructor(private readonly budGetRepository: BudgetItemDetailsRepository) {}

  async execute(id: string): Promise<BudGetItemDetailsEntity | null> {
    return await this.budGetRepository.findById(id);
  }
}
