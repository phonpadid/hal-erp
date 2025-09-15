import type { ReceiptRepository } from "@/modules/domain/repository/receipt.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { ReciptQueryDto } from "../../dtos/receipt.dto";

export class GetAllReceiptUseCase {
  constructor(private readonly repo: ReceiptRepository) {}

  async execute(
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ReciptQueryDto>> {
    return await this.repo.findAll(params, includeDeleted);
  }
}
