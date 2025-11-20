import { VendorProductEntity } from "../../domain/entities/vendor-products/vendor-product.entity";
import type { VendorProductRepository } from "@/modules/domain/repository/vendor-products/vendor-product.repository";
import type { VendorProductApiModel, CreateVendorProductApiRequest, UpdateVendorProductApiRequest } from "@/modules/interfaces/vendor-products/vendor-product.interface";
import { api } from "@/common/config/axios/axios";

export class ApiVendorProductRepository implements VendorProductRepository {
  private readonly baseUrl = "/vendor-products";

  private toDomainModel(apiModel: VendorProductApiModel): VendorProductEntity {
    return VendorProductEntity.fromApiResponse(apiModel);
  }

  private toCreateApiRequest(entity: VendorProductEntity): CreateVendorProductApiRequest {
    return {
      vendor_id: entity.getVendorId(),
      product_id: entity.getProductId(),
      product_name: entity.getProductName(),
    };
  }

  private toUpdateApiRequest(entity: VendorProductEntity): UpdateVendorProductApiRequest {
    return {
      vendor_id: entity.getVendorId(),
      product_id: entity.getProductId(),
      product_name: entity.getProductName(),
    };
  }

  async getAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    vendor_id?: number;
    product_id?: number;
    includeDeleted?: boolean;
  }): Promise<{
    vendor_products: VendorProductEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();

      if (options?.page) params.append("page", options.page.toString());
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.search) params.append("search", options.search);
      if (options?.vendor_id) params.append("vendor_id", options.vendor_id.toString());
      if (options?.product_id) params.append("product_id", options.product_id.toString());
      if (options?.includeDeleted) params.append("include_deleted", "false");

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);

      // Handle different possible response structures
      const data = response.data;
      let vendorProducts = [];
      let total = 0;
      let page = options?.page || 1;
      let limit = options?.limit || 10;

      if (Array.isArray(data)) {
        // Direct array response
        vendorProducts = data.map((vendorProduct: VendorProductApiModel) => this.toDomainModel(vendorProduct));
        total = data.length;
      } else if (data.data && Array.isArray(data.data)) {
        // Paginated response with data property
        vendorProducts = data.data.map((vendorProduct: VendorProductApiModel) => this.toDomainModel(vendorProduct));
        total = data.total || data.data.length;
        page = data.page || page;
        limit = data.limit || limit;
      } else {
        console.warn("Unexpected API response structure:", data);
        throw new Error("Invalid API response structure");
      }

      return {
        vendor_products: vendorProducts,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error("VendorProduct API Error Details:", {
        baseUrl: this.baseUrl,
        options,
        error: error,
      });

      if (error instanceof Error) {
        throw new Error(`Failed to fetch vendor products: ${error.message}`);
      }
      throw new Error("Failed to fetch vendor products");
    }
  }

  async getById(id: string, includeDeleted?: boolean): Promise<VendorProductEntity | null> {
    try {
      const params = includeDeleted ? "?include_deleted=true" : "";
      const response = await api.get(`${this.baseUrl}/${id}${params}`);
      return this.toDomainModel(response.data);
    } catch (error) {
      console.error("VendorProduct fetch error:", error);
      return null;
    }
  }

  async create(vendorProduct: VendorProductEntity): Promise<VendorProductEntity> {
    try {
      const response = await api.post(this.baseUrl, this.toCreateApiRequest(vendorProduct));
      return this.toDomainModel(response.data);
    } catch (error) {
      console.error("VendorProduct create error:", error);
      throw error instanceof Error ? error : new Error("Failed to create vendor product");
    }
  }

  async update(id: string, vendorProduct: VendorProductEntity): Promise<VendorProductEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, this.toUpdateApiRequest(vendorProduct));
      return this.toDomainModel(response.data);
    } catch (error) {
      console.error("VendorProduct update error:", error);
      throw error instanceof Error ? error : new Error("Failed to update vendor product");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error("VendorProduct delete error:", error);
      throw error instanceof Error ? error : new Error("Failed to delete vendor product");
    }
  }

  async restore(id: string): Promise<VendorProductEntity> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/restore`);
      return this.toDomainModel(response.data);
    } catch (error) {
      console.error("VendorProduct restore error:", error);
      throw error instanceof Error ? error : new Error("Failed to restore vendor product");
    }
  }

  async exists(vendor_id: number, product_id: number): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append("vendor_id", vendor_id.toString());
      params.append("product_id", product_id.toString());

      const response = await api.get(`${this.baseUrl}/exists?${params.toString()}`);
      return response.data.exists;
    } catch (error) {
      console.log("VendorProduct exists check error:", error);
      return false;
    }
  }

  async getByVendorId(vendorId: number): Promise<VendorProductEntity[]> {
    try {
      const response = await api.get(`${this.baseUrl}/vendor/${vendorId}`);
      const data = response.data;

      if (Array.isArray(data)) {
        return data.map((vendorProduct: VendorProductApiModel) => this.toDomainModel(vendorProduct));
      } else if (data.data && Array.isArray(data.data)) {
        return data.data.map((vendorProduct: VendorProductApiModel) => this.toDomainModel(vendorProduct));
      }
      return [];
    } catch (error) {
      console.error("VendorProduct getByVendorId error:", error);
      return [];
    }
  }

  async getByProductId(productId: number): Promise<VendorProductEntity[]> {
    try {
      const response = await api.get(`${this.baseUrl}/product/${productId}`);
      const data = response.data;

      if (Array.isArray(data)) {
        return data.map((vendorProduct: VendorProductApiModel) => this.toDomainModel(vendorProduct));
      } else if (data.data && Array.isArray(data.data)) {
        return data.data.map((vendorProduct: VendorProductApiModel) => this.toDomainModel(vendorProduct));
      }
      return [];
    } catch (error) {
      console.error("VendorProduct getByProductId error:", error);
      return [];
    }
  }
}