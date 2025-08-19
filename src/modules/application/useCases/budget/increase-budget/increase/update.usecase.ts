import type { IncreaseBudgetRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget.repository";
import type { IncreaseBudGetAccountsEntity } from "@/modules/domain/entities/budget/increase/increase-budget.entity";
import type { IncreaseBudgetAccountUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-budget.dto";

export class UpdateIncreaseBudgetUseCase {
  constructor(private readonly repo: IncreaseBudgetRepository) {}

  async execute(
    id: string,
    input: IncreaseBudgetAccountUpdateDTO
  ): Promise<IncreaseBudGetAccountsEntity> {
    const budGet = await this.repo.findById(id);
    if (!budGet) {
      throw new Error(`Budget with id ${id} not found`);
    }

    return await this.repo.update(id, input);
  }
}
