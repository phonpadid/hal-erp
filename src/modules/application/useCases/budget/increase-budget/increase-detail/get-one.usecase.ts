import type { IncreaseBudgetItemRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget-item.repository";
import type { IcraseDetailEntity } from "@/modules/domain/entities/budget/increase/increase-detail.entity";

export class GetIncreaseBudgetItemByIdUseCase {
  constructor(private readonly repo: IncreaseBudgetItemRepository) {}

  async execute(id: string): Promise<IcraseDetailEntity | null> {
    return await this.repo.findById(id);
  }
}
