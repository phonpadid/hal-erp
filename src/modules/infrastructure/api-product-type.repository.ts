import type { ProductTypeRepository } from "@/modules/domain/repository/product-type.repository";
import { ProductTypeEntity } from "@/modules/domain/entities/product-types.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { CreateProductTypeDTO, UpdateProductTypeDTO } from "@/modules/application/dtos/product-type.dto";

export class ApiProductTypeRepository implements ProductTypeRepository {
  private readonly baseUrl = "/product-types";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ProductTypeEntity>> {
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
        data: response.data.data.map((productType: any) => this.toDomainModel(productType)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch product types list");
    }
  }

  async findById(id: string): Promise<ProductTypeEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find product type with id ${id}`);
    }
  }

  async findByName(name: string): Promise<ProductTypeEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { name, limit: 5 },
      });

      const data = response.data.data;
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }
      const found = data.find(
        (pt: any) =>
          pt.name === name && (pt.deleted_at === null || pt.deleted_at === undefined)
      );
      if (!found) return null;

      return this.toDomainModel(found);
    } catch (error) {
      console.error(`Error finding product type by name '${name}':`, error);
      return null;
    }
  }

  async create(productTypeData: CreateProductTypeDTO): Promise<ProductTypeEntity> {
    try {
      const response = await api.post(this.baseUrl, productTypeData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create product type");
    }
  }

  async update(id: string, updateProductTypeDTO: UpdateProductTypeDTO): Promise<ProductTypeEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, updateProductTypeDTO);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update product type with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete product type with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/${id}/restore`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to restore product type with id ${id}`);
    }
  }

  private toDomainModel(productType: any): ProductTypeEntity {
    return new ProductTypeEntity(
      productType.id?.toString() ?? "",
      productType.name ?? "",
      productType.category_id?.toString() ?? null,
      productType.created_at ?? "",
      productType.updated_at ?? "",
      productType.deleted_at ?? null
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