import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";
import { QuotaEntity } from "../../../domain/entities/quotas/quota.entity";
import type { UpdateQuotaDTO } from "../../dtos/quotas/quota.dto";

export class UpdateQuotaUseCase {
  constructor(private readonly quotaRepository: QuotaRepository) {}

  async execute(quotaData: UpdateQuotaDTO): Promise<QuotaEntity> {
    console.log('🔄 UseCase - Update quota with data:', quotaData);

    // Get existing quota
    const existingQuota = await this.quotaRepository.getById(quotaData.id);
    if (!existingQuota) {
      throw new Error("Quota not found");
    }

    console.log('📋 UseCase - Existing quota:', {
      id: existingQuota.getId(),
      qty: existingQuota.getQty(),
      vendorProductId: existingQuota.getVendorProductId(),
      year: existingQuota.getYear()
    });

    if (existingQuota.isDeleted()) {
      throw new Error("Cannot update deleted quota");
    }

    // Update quota entity
    const updatedQuota = existingQuota.update({
      company_id: quotaData.company_id,
      vendor_product_id: quotaData.vendor_product_id,
      qty: quotaData.qty,
      year: quotaData.year,
    });

    console.log('🔄 UseCase - Updated entity:', {
      id: updatedQuota.getId(),
      qty: updatedQuota.getQty(),
      vendorProductId: updatedQuota.getVendorProductId(),
      year: updatedQuota.getYear()
    });

    // Validate the updated entity
    const errors = updatedQuota.validate();
    if (errors.length > 0) {
      console.error('❌ UseCase - Validation errors:', errors);
      throw new Error(`Validation errors: ${errors.join(", ")}`);
    }

    // Save to repository
    return await this.quotaRepository.update(quotaData.id, updatedQuota);
  }
}
