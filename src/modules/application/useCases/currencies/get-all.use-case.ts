
import type { CurrencyEntity } from "@/modules/domain/entities/currency.entity";
import type { CurrencyRepository } from "@/modules/domain/repository/currency.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllCurrencyUseCase {
  constructor(private readonly currencyRepo: CurrencyRepository) {}

  async execute(
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CurrencyEntity>> {
    return await this.currencyRepo.findAll(params, includeDeleted);
  }
}
