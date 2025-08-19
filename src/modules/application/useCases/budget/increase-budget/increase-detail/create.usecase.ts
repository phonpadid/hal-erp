import type { IncreaseBudgetItemRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget-item.repository";
import type { IncreaseBudgetAccountDetailCreateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-detail.dto";
import type { IcraseDetailEntity } from "@/modules/domain/entities/budget/increase/increase-detail.entity";

export class CreateIncreaseBudgetItemUseCase {
  constructor(private readonly repo: IncreaseBudgetItemRepository) {}

  async execute(id: number, input: IncreaseBudgetAccountDetailCreateDTO): Promise<IcraseDetailEntity> {

    return await this.repo.create(id, input);
  }
}
