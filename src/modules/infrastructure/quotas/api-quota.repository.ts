import axios from "axios";
import { QuotaEntity } from "../../domain/entities/quotas/quota.entity";
import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";
import type { QuotaApiModel } from "@/modules/interfaces/quotas/quota.interface";

export class ApiQuotaRepository implements QuotaRepository {
  private readonly baseUrl = "/api/quotas";

  private toDomainModel(apiModel: QuotaApiModel): QuotaEntity {
    return QuotaEntity.restore({
      id: apiModel.id.toString(),
      company_id: apiModel.company_id,
      vendor_id: apiModel.vendor_id,
      product_id: apiModel.product_id,
      qty: apiModel.qty,
      year: apiModel.year,
      created_at: new Date(apiModel.created_at || Date.now()),
      updated_at: new Date(apiModel.updated_at || Date.now()),
      deleted_at: apiModel.deleted_at ? new Date(apiModel.deleted_at) : null,
    });
  }

  private toApiModel(entity: QuotaEntity): Omit<QuotaApiModel, "id" | "created_at" | "updated_at" | "deleted_at"> {
    return {
      company_id: entity.getCompanyId(),
      vendor_id: entity.getVendorId(),
      product_id: entity.getProductId(),
      qty: entity.getQty(),
      year: entity.getYear(),
    };
  }

  async getAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    company_id?: number;
    vendor_id?: number;
    product_id?: number;
    year?: string;
    includeDeleted?: boolean;
  }): Promise<{
    quotas: QuotaEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();

      if (options?.page) params.append("page", options.page.toString());
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.search) params.append("search", options.search);
      if (options?.company_id) params.append("company_id", options.company_id.toString());
      if (options?.vendor_id) params.append("vendor_id", options.vendor_id.toString());
      if (options?.product_id) params.append("product_id", options.product_id.toString());
      if (options?.year) params.append("year", options.year);
      if (options?.includeDeleted) params.append("include_deleted", "true");

      const response = await axios.get(`${this.baseUrl}?${params.toString()}`);

      return {
        quotas: response.data.data.map((quota: QuotaApiModel) => this.toDomainModel(quota)),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch quotas: ${error.response?.data?.message || error.message}`);
      }
      throw new Error("Failed to fetch quotas");
    }
  }

  async getById(id: string, includeDeleted?: boolean): Promise<QuotaEntity | null> {
    try {
      const params = includeDeleted ? "?include_deleted=true" : "";
      const response = await axios.get(`${this.baseUrl}/${id}${params}`);
      return this.toDomainModel(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch quota:`);
    }
  }

  async create(quota: QuotaEntity): Promise<QuotaEntity> {
    try {
      const response = await axios.post(this.baseUrl, this.toApiModel(quota));
      return this.toDomainModel(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create quota:`);
      }
      throw new Error("Failed to create quota");
    }
  }

  async update(id: string, quota: QuotaEntity): Promise<QuotaEntity> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, this.toApiModel(quota));
      return this.toDomainModel(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update quota: ${error.response?.data?.message || error.message}`);
      }
      throw new Error("Failed to update quota");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to delete quota: ${error.response?.data?.message || error.message}`);
      }
      throw new Error("Failed to delete quota");
    }
  }

  async restore(id: string): Promise<QuotaEntity> {
    try {
      const response = await axios.post(`${this.baseUrl}/${id}/restore`);
      return this.toDomainModel(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to restore quota: ${error.response?.data?.message || error.message}`);
      }
      throw new Error("Failed to restore quota");
    }
  }

  async exists(company_id: number, vendor_id: number, product_id: number, year: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append("company_id", company_id.toString());
      params.append("vendor_id", vendor_id.toString());
      params.append("product_id", product_id.toString());
      params.append("year", year);

      const response = await axios.get(`${this.baseUrl}/exists?${params.toString()}`);
      return response.data.exists;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  async getByUniqueKey(company_id: number, vendor_id: number, product_id: number, year: string): Promise<QuotaEntity | null> {
    try {
      const params = new URLSearchParams();
      params.append("company_id", company_id.toString());
      params.append("vendor_id", vendor_id.toString());
      params.append("product_id", product_id.toString());
      params.append("year", year);

      const response = await axios.get(`${this.baseUrl}/unique?${params.toString()}`);
      return this.toDomainModel(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch quota`);
    }
  }
}
