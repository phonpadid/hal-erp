import { QuotaEntity } from "../../../../domain/entities/quotas/quota.entity";
import type { CreateQuotaDTO, UpdateQuotaDTO, GetQuotasDTO } from "../../../dtos/quotas/quota.dto";

export interface IQuotaService {
  /**
   * Get all quotas with pagination and filtering
   */
  getQuotas(params?: GetQuotasDTO): Promise<{
    quotas: QuotaEntity[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Get quota by ID
   */
  getQuotaById(id: string): Promise<QuotaEntity | null>;

  /**
   * Create new quota
   */
  createQuota(quotaData: CreateQuotaDTO): Promise<QuotaEntity>;

  /**
   * Update existing quota
   */
  updateQuota(quotaData: UpdateQuotaDTO): Promise<QuotaEntity>;

  /**
   * Delete quota
   */
  deleteQuota(id: string): Promise<void>;
}