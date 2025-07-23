import type { BudgetItemRepository } from "@/modules/domain/repository/budget/budget-item.repository";
import type { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";

export class GetBudgetItemByIdUseCase {
  constructor(private readonly budGetRepository: BudgetItemRepository) {}

  async execute(id: string): Promise<BudGetItemEntity | null> {
    return await this.budGetRepository.findById(id);
  }
}
