
import type { CurrencyEntity } from "@/modules/domain/entities/currency.entity";
import type { CurrencyRepository } from "@/modules/domain/repository/currency.repository";

export class GetOneCurrencyUseCase {
  constructor(private readonly currencyRepo: CurrencyRepository) { }

  async execute(
    id: string
  ): Promise<CurrencyEntity | null> {
    return await this.currencyRepo.findById(id);
  }
}
