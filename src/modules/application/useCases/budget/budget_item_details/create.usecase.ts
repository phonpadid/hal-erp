import type { CreateBudgetItemDetailsInterface } from "@/modules/interfaces/budget/budget-item-details.interface";
import type { BudgetItemDetailsRepository } from "@/modules/domain/repository/budget/budget-item-details.repository";
import type { BudGetItemDetailsEntity } from "@/modules/domain/entities/budget/budget-item-details.entities";

export class CreateBudgetItemDetailsUseCase {
  constructor(private readonly budGetItemDetails: BudgetItemDetailsRepository) {}

  async execute(budGetdata: CreateBudgetItemDetailsInterface): Promise<BudGetItemDetailsEntity> {
    return await this.budGetItemDetails.create(budGetdata);
  }
}
