
import type { ExchangeRateEntity } from "@/modules/domain/entities/exchange-rate.entities";
import type { ExchangeRateRepository } from "@/modules/domain/repository/exchange-rate.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllExchangeRateUseCase {
  constructor(private readonly repo: ExchangeRateRepository) {}

  async execute(
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ExchangeRateEntity>> {
    return await this.repo.findAll(params, includeDeleted);
  }
}
