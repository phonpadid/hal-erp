import type { ProductRepository } from "@/modules/domain/repository/product.repository";
import { ProductEntity } from "@/modules/domain/entities/product.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { CreateProductDTO, UpdateProductDTO } from "@/modules/application/dtos/product.dto";

export class ApiProductRepository implements ProductRepository {
  private readonly baseUrl = "/products";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ProductEntity>> {
    try {
      const response = await api.get(this.baseUrl, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          sort_by: params.sortBy,
          sortDirection: params.sortDirection,
          include_deleted: includeDeleted,
        },
      });

      return {
        data: response.data.data.map((product: any) => this.toDomainModel(product)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch products list");
    }
  }

  async findById(id: string): Promise<ProductEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find product with id ${id}`);
    }
  }

  async findByName(name: string): Promise<ProductEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { name, limit: 5 },
      });

      const data = response.data.data;
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }
      const found = data.find(
        (p: any) =>
          p.name === name && (p.deleted_at === null || p.deleted_at === undefined)
      );
      if (!found) return null;

      return this.toDomainModel(found);
    } catch (error) {
      console.error(`Error finding product by name '${name}':`, error);
      return null;
    }
  }

  async findByProductTypeId(product_type_id: number): Promise<ProductEntity[]> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { product_type_id },
      });

      const data = response.data.data;
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      return data
        .filter((p: any) => p.deleted_at === null || p.deleted_at === undefined)
        .map((product: any) => this.toDomainModel(product));
    } catch (error) {
      console.error(`Error finding products by product_type_id '${product_type_id}':`, error);
      return [];
    }
  }

  async create(productData: CreateProductDTO): Promise<ProductEntity> {
    try {
      const response = await api.post(this.baseUrl, productData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create product");
    }
  }

  async update(id: string, updateProductDTO: UpdateProductDTO): Promise<ProductEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, updateProductDTO);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update product with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete product with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/${id}/restore`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to restore product with id ${id}`);
    }
  }

  private toDomainModel(product: any): ProductEntity {
    return new ProductEntity(
      product.id?.toString() ?? "",
      product.name ?? "",
      product.description ?? "",
      product.product_type_id ?? 0,
      product.status ?? "active",
      product.created_at ?? "",
      product.updated_at ?? "",
      product.deleted_at ?? null
    );
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(serverMessage);
    } else if (axiosError.request) {
      throw new Error(
        "Network Error: The request was made but no response was received. Please check your connection."
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}