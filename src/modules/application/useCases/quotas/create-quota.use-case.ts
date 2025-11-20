import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";
import { QuotaEntity } from "../../../domain/entities/quotas/quota.entity";
import type { CreateQuotaDTO } from "../../dtos/quotas/quota.dto";

export class CreateQuotaUseCase {
  constructor(private readonly quotaRepository: QuotaRepository) {}

  async execute(quotaData: CreateQuotaDTO): Promise<QuotaEntity> {
    // Create new quota entity directly (skip duplicate check for now)
    const quota = QuotaEntity.create(quotaData);

    // Validate the entity
    const errors = quota.validate();
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(", ")}`);
    }

    // Save to repository
    return await this.quotaRepository.create(quota);
  }
}
