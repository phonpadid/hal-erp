import type {
  VendorProductCreateInterface,
  VendorProductUpdateInterface,
} from "@/modules/interfaces/vendors/vendor_product/vendor-product.interface";
import { VendorProductEntity } from "@/modules/domain/entities/vendor-products/vendor-product.entity";
import type { VendorProductRepository } from "@/modules/domain/repository/vendors/vendor_product/vendor-product.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiVendorProductRepository implements VendorProductRepository {
  private readonly baseUrl = "/vendor-products";

  async findAll(
    params: PaginationParams = { page: 1, limit: 10 },
    vendorId?: number,
    productId?: number,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<VendorProductEntity>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: any = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
        sort_by: params.sortBy,
        sortDirection: params.sortDirection,
        include_deleted: includeDeleted,
      };

      if (vendorId) {
        queryParams.vendor_id = vendorId;
      }

      if (productId) {
        queryParams.product_id = productId;
      }

      const response = await api.get(this.baseUrl, { params: queryParams });

      if (!response.data || !response.data.data || !response.data.pagination) {
        throw new Error("Invalid response format from API");
      }

      return {
        data: response.data.data.map((vendorProduct: unknown) => this.toDomainModel(vendorProduct)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch vendor products list");
    }
  }

  async findById(id: string): Promise<VendorProductEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find vendor product with id ${id}`);
    }
  }

  async findByVendorId(vendorId: number): Promise<VendorProductEntity[]> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { vendor_id: vendorId, limit: 1000 },
      });

      return response.data.data.map((vendorProduct: unknown) => this.toDomainModel(vendorProduct));
    } catch (error) {
      console.error(`Error finding vendor products by vendor id '${vendorId}':`, error);
      return [];
    }
  }

  async findByProductId(productId: number): Promise<VendorProductEntity[]> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { product_id: productId, limit: 1000 },
      });

      return response.data.data.map((vendorProduct: unknown) => this.toDomainModel(vendorProduct));
    } catch (error) {
      console.error(`Error finding vendor products by product id '${productId}':`, error);
      return [];
    }
  }

  async findByVendorAndProduct(vendorId: number, productId: number): Promise<VendorProductEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { vendor_id: vendorId, product_id: productId, limit: 1 },
      });

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error(`Error finding vendor product by vendor '${vendorId}' and product '${productId}':`, error);
      return null;
    }
  }

  async create(vendorProductData: VendorProductCreateInterface): Promise<VendorProductEntity> {
    try {
      const response = await api.post(this.baseUrl, vendorProductData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create vendor product");
    }
  }

  async update(id: string, vendorProductData: VendorProductUpdateInterface): Promise<VendorProductEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, vendorProductData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update vendor product with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete vendor product with id ${id}`);
    }
  }

  async restore(id: string): Promise<VendorProductEntity> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/restore`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to restore vendor product with id ${id}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomainModel(vendorProduct: any): VendorProductEntity {
    // Handle both old and new API response formats
    const vendorName = vendorProduct.vendor?.name || vendorProduct.vendor_name;
    const productName = vendorProduct.product?.name || vendorProduct.product_name;

    const currency = vendorProduct.currency ? {
      id: vendorProduct.currency.id?.toString() || vendorProduct.currency.id.toString(),
      code: vendorProduct.currency.code,
      name: vendorProduct.currency.name,
    } : null;

    return VendorProductEntity.fromApiResponse({
      ...vendorProduct,
      vendor_name: vendorName,
      product_name: productName,
      currency: currency,
    });
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{
      message?: string;
      status_code?: number;
    }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(serverMessage);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}