import axios from "axios";
import { QuotaEntity } from "../../domain/entities/quotas/quota.entity";
import type { QuotaRepository } from "@/modules/domain/repository/quotas/quota.repository";
import type { QuotaApiModel, CreateQuotaApiRequest, UpdateQuotaApiRequest } from "@/modules/interfaces/quotas/quota.interface";
import { api } from "@/common/config/axios/axios";

export class ApiQuotaRepository implements QuotaRepository {
  private readonly baseUrl = "/quota-company";

  private toDomainModel(apiModel: QuotaApiModel): QuotaEntity {
    const entity = QuotaEntity.fromApiResponse(apiModel);

    // Store additional information for display purposes
    if (apiModel.vendor_product) {
      (entity as any).vendor_product = apiModel.vendor_product;
    }
    if (apiModel.product) {
      (entity as any).product = apiModel.product;
    }

    return entity;
  }

  private toCreateApiRequest(entity: QuotaEntity): CreateQuotaApiRequest {
    return {
      qty: entity.getQty(),
      vendor_product_id: entity.getVendorProductId(),
      year: entity.getYear(),
    };
  }

  private toUpdateApiRequest(entity: QuotaEntity): UpdateQuotaApiRequest {
    return {
      qty: entity.getQty(),
      vendor_product_id: entity.getVendorProductId(),
      year: entity.getYear(),
    };
  }

  async getAll(options?: {
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
  }> {
    try {
      const params = new URLSearchParams();

      if (options?.page) params.append("page", options.page.toString());
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.search) params.append("search", options.search);
      if (options?.column) params.append("column", options.column);
      if (options?.sort_order) params.append("sort_order", options.sort_order);
      if (options?.company_id) params.append("company_id", options.company_id.toString());
      if (options?.vendor_id) params.append("vendor_id", options.vendor_id.toString());
      if (options?.product_id) params.append("product_id", options.product_id.toString());
      if (options?.vendor_product_id) params.append("vendor_product_id", options.vendor_product_id.toString());
      if (options?.year) params.append("year", options.year);
      if (options?.includeDeleted) params.append("include_deleted", "true");

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);

      // Handle different possible response structures
      const data = response.data;
      let quotas = [];
      let total = 0;
      let page = options?.page || 1;
      let limit = options?.limit || 10;

      

      // Check if response has nested pagination object (the actual structure from backend)
      if (data.pagination && Array.isArray(data.data)) {
        // Backend response: { data: [...], pagination: { total: 12, page: 1, limit: 10 } }
       
        quotas = data.data.map((quota: QuotaApiModel) => this.toDomainModel(quota));
        total = data.pagination.total || data.data.length;
        page = data.pagination.page || page;
        limit = data.pagination.limit || limit;

       
      } else if (Array.isArray(data)) {
       
        quotas = data.map((quota: QuotaApiModel) => this.toDomainModel(quota));

        // Fallback: if no pagination metadata, use array length as total
        total = data.length;
     
      } else if (data.data && Array.isArray(data.data)) {
        // Legacy paginated response format
      
        quotas = data.data.map((quota: QuotaApiModel) => this.toDomainModel(quota));
        total = data.total || data.data.length;
        page = data.page || page;
        limit = data.limit || limit;

       
      } else {
        console.error("❌ Unexpected API response structure:", data);
        throw new Error("Invalid API response structure");
      }

      return {
        quotas,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error("API Repository: Get all error:", error);

      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch quotas: ${error.response?.data?.message || error.message}`);
      }
      throw new Error("Failed to fetch quotas");
    }
  }

  async getById(id: string, includeDeleted?: boolean): Promise<QuotaEntity | null> {
    try {
      const params = includeDeleted ? "?include_deleted=true" : "";
      const response = await api.get(`${this.baseUrl}/${id}${params}`);
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
      const requestData = this.toCreateApiRequest(quota);
      const response = await api.post(this.baseUrl, requestData);
      // Handle server success even if response data doesn't contain proper structure
      if (response.status === 201 || response.status === 200) {
      

        // If response is missing id field, create entity from request data
        if (!response.data || (typeof response.data === 'object' && !response.data.id)) {
        
          const generatedId = Date.now() + Math.floor(Math.random() * 1000);
          return this.toDomainModel({
            id: generatedId,
            vendor_product_id: requestData.vendor_product_id,
            qty: requestData.qty,
            year: requestData.year,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null
          });
        }
      }

      // Validate response data
      if (!response.data) {
        throw new Error("No data received from server");
      }

    
      const domainModel = this.toDomainModel(response.data);
      return domainModel;
    } catch (error) {
      console.error("API Repository: Create error:", error);
     
      throw new Error("Failed to create quota");
    }
  }

  async update(id: string, quota: QuotaEntity): Promise<QuotaEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, this.toUpdateApiRequest(quota));
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
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to delete quota: ${error.response?.data?.message || error.message}`);
      }
      throw new Error("Failed to delete quota");
    }
  }

  async restore(id: string): Promise<QuotaEntity> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/restore`);
      return this.toDomainModel(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to restore quota: ${error.response?.data?.message || error.message}`);
      }
      throw new Error("Failed to restore quota");
    }
  }

  async exists(company_id: number | undefined, vendor_product_id: number, year: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      if (company_id) {
        params.append("company_id", company_id.toString());
      }
      params.append("vendor_product_id", vendor_product_id.toString());
      params.append("year", year);

      const response = await api.get(`${this.baseUrl}/exists?${params.toString()}`);
      return response.data.exists;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  async getByUniqueKey(company_id: number | undefined, vendor_product_id: number, year: string): Promise<QuotaEntity | null> {
    try {
      const params = new URLSearchParams();
      if (company_id) {
        params.append("company_id", company_id.toString());
      }
      params.append("vendor_product_id", vendor_product_id.toString());
      params.append("year", year);

      const response = await api.get(`${this.baseUrl}/unique?${params.toString()}`);
      return this.toDomainModel(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch quota`);
    }
  }
}
