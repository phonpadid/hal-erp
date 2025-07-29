import type { ExchangeRateRepository } from "@/modules/domain/repository/exchange-rate.repository";

export class DeleteExchangeRateUseCase {
  constructor(private readonly repo: ExchangeRateRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.repo.delete(id);
  }
}
