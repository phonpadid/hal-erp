import { QuotaEntity } from "../../entities/quotas/quota.entity";

export interface QuotaRepository {
  /**
   * Get all quotas with pagination
   */
  getAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    column?: string;
    sort_order?: string;
    company_id?: number;
    vendor_id?: number;
    product_id?: number;
    vendor_product_id?: number;
    year?: string;
    includeDeleted?: boolean;
  }): Promise<{
    quotas: QuotaEntity[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Get quota by ID
   */
  getById(id: string, includeDeleted?: boolean): Promise<QuotaEntity | null>;

  /**
   * Create new quota
   */
  create(quota: QuotaEntity): Promise<QuotaEntity>;

  /**
   * Update existing quota
   */
  update(id: string, quota: QuotaEntity): Promise<QuotaEntity>;

  /**
   * Delete quota (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Restore deleted quota
   */
  restore(id: string): Promise<QuotaEntity>;

  /**
   * Check if quota exists for specific combination
   */
  exists(company_id: number | undefined, vendor_product_id: number, year: string): Promise<boolean>;

  /**
   * Get quota by unique combination
   */
  getByUniqueKey(company_id: number | undefined, vendor_product_id: number, year: string): Promise<QuotaEntity | null>;
}