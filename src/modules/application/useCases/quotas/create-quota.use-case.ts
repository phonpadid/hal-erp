import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";
import { QuotaEntity } from "../../../domain/entities/quotas/quota.entity";
import type { CreateQuotaDTO } from "../../dtos/quotas/quota.dto";

export class CreateQuotaUseCase {
  constructor(private readonly quotaRepository: QuotaRepository) {}

  async execute(quotaData: CreateQuotaDTO): Promise<QuotaEntity> {
    // Check if quota already exists for this combination
    const existingQuota = await this.quotaRepository.getByUniqueKey(
      quotaData.company_id,
      quotaData.vendor_id,
      quotaData.product_id,
      quotaData.year
    );

    if (existingQuota && !existingQuota.isDeleted()) {
      throw new Error("Quota already exists for this vendor, product, and year");
    }

    // Create new quota entity
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
