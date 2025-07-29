import type { BudgetItemDetailsRepository } from "@/modules/domain/repository/budget/budget-item-details.repository";
import type { BudGetItemDetailsEntity } from "@/modules/domain/entities/budget/budget-item-details.entities";
import type { UpdateBudgetItemDetailsInterface } from "@/modules/interfaces/budget/budget-item-details.interface";

export class UpdateBudgetItemDetailsUseCase {
  constructor(private readonly budGetRepository: BudgetItemDetailsRepository) {}

  async execute(
    id: string,
    budGetdata: UpdateBudgetItemDetailsInterface
  ): Promise<BudGetItemDetailsEntity> {
    return await this.budGetRepository.update(id, budGetdata);
  }
}
