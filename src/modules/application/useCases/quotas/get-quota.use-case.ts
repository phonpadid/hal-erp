import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";
import { QuotaEntity } from "../../../domain/entities/quotas/quota.entity";
import type { GetQuotasDTO } from "../../dtos/quotas/quota.dto";

export class GetQuotasUseCase {
  constructor(private readonly quotaRepository: QuotaRepository) {}

  async execute(params: GetQuotasDTO = {}): Promise<{
    quotas: QuotaEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      company_id,
      vendor_id,
      product_id,
      year,
    } = params;

    return await this.quotaRepository.getAll({
      page,
      limit,
      search,
      company_id,
      vendor_id,
      product_id,
      year,
      includeDeleted: false,
    });
  }
}
