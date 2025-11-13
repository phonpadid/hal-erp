import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";
import { QuotaEntity } from "../../../domain/entities/quotas/quota.entity";
export class GetOneQuotaUseCase {
  constructor(private readonly quotaRepository: QuotaRepository) {}

  async execute(id: string): Promise<QuotaEntity | null> {
    return await this.quotaRepository.getById(id);
  }
}
