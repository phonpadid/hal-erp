import type { IncreaseBudgetItemRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget-item.repository";
import type { IncreaseBudgetAccountDetailUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-detail.dto";
import type { IcraseDetailEntity } from "@/modules/domain/entities/budget/increase/increase-detail.entity";

export class UpdateIncreaseBudgetItemUseCase {
  constructor(private readonly repo: IncreaseBudgetItemRepository) {}

  async execute(
    id: string,
    input: IncreaseBudgetAccountDetailUpdateDTO
  ): Promise<IcraseDetailEntity> {
    const budGet = await this.repo.findById(id);
    if (!budGet) {
      throw new Error(`Budget with id ${id} not found`);
    }

    return await this.repo.update(id, input);
  }
}
