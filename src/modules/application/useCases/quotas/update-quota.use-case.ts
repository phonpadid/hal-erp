import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";
import { QuotaEntity } from "../../../domain/entities/quotas/quota.entity";
import type { UpdateQuotaDTO } from "../../dtos/quotas/quota.dto";

export class UpdateQuotaUseCase {
  constructor(private readonly quotaRepository: QuotaRepository) {}

  async execute(quotaData: UpdateQuotaDTO): Promise<QuotaEntity> {
    // Get existing quota
    const existingQuota = await this.quotaRepository.getById(quotaData.id);
    if (!existingQuota) {
      throw new Error("Quota not found");
    }

    if (existingQuota.isDeleted()) {
      throw new Error("Cannot update deleted quota");
    }

    // Skip duplicate check for now - go directly to update

    // Update quota entity
    const updatedQuota = existingQuota.update({
      company_id: quotaData.company_id,
      vendor_product_id: quotaData.vendor_product_id,
      qty: quotaData.qty,
      year: quotaData.year,
    });

    // Validate the updated entity
    const errors = updatedQuota.validate();
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(", ")}`);
    }

    // Save to repository
    return await this.quotaRepository.update(quotaData.id, updatedQuota);
  }
}
