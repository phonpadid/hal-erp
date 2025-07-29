import type { ExchangeRateEntity } from "@/modules/domain/entities/exchange-rate.entities";
import type { ExchangeRateRepository } from "@/modules/domain/repository/exchange-rate.repository";

export class GetOneExchangeRateUseCase {
  constructor(private readonly repo: ExchangeRateRepository) { }

  async execute(
    id: string
  ): Promise<ExchangeRateEntity | null> {
    return await this.repo.findById(id);
  }
}
