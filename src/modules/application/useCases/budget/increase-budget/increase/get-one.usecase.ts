import type { IncreaseBudgetRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget.repository";
import type { IncreaseBudGetAccountsEntity } from "@/modules/domain/entities/budget/increase/increase-budget.entity";

export class GetIncreaseBudgetByIdUseCase {
  constructor(private readonly repo: IncreaseBudgetRepository) {}

  async execute(id: string): Promise<IncreaseBudGetAccountsEntity | null> {
    return await this.repo.findById(id);
  }
}
