import type { BankRepository } from "@/modules/domain/repository/bank.repository";
import type { BankEntity } from "@/modules/domain/entities/bank.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllBankUseCase {
  constructor(private readonly bankRepository: BankRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BankEntity>> {
    return await this.bankRepository.findAll(params, includeDeleted);
  }
}
