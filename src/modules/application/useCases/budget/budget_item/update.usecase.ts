import type { BudgetItemRepository } from "@/modules/domain/repository/budget/budget-item.repository";
import type { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";
import type { UpdateBudgetItemInterface } from "@/modules/interfaces/budget/budget-item.interface";

export class UpdateBudgetItemDetailsUseCase {
  constructor(private readonly budGetRepository: BudgetItemRepository) {}

  async execute(id: string, budGetdata: UpdateBudgetItemInterface): Promise<BudGetItemEntity> {
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
