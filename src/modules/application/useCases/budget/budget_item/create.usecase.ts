import type { CreateBudgetItemInterface } from "@/modules/interfaces/budget/budget-item.interface";
import type { BudgetItemRepository } from "@/modules/domain/repository/budget/budget-item.repository";
import type { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";

export class CreateBudgetItemUseCase {
  constructor(private readonly budGetItem: BudgetItemRepository) {}

  async execute(budGetdata: CreateBudgetItemInterface): Promise<BudGetItemEntity> {
    return await this.budGetItem.create(budGetdata);
  }
}
