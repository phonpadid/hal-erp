import type { IncreaseBudgetRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget.repository";
import type { IncreaseBudgetAccountCreateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-budget.dto";
import type { IncreaseBudGetAccountsEntity } from "@/modules/domain/entities/budget/increase/increase-budget.entity";

export class CreateIncreaseBudgetUseCase {
  constructor(private readonly repo: IncreaseBudgetRepository) {}

  async execute(input: IncreaseBudgetAccountCreateDTO): Promise<IncreaseBudGetAccountsEntity> {

    return await this.repo.create(input);
  }
}
