import type { ProductRepository } from "@/modules/domain/repository/product.repository";
import { ProductEntity } from "@/modules/domain/entities/product.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { CreateProductDTO, UpdateProductDTO } from "@/modules/application/dtos/product.dto";
import type { UnitApiModel, UnitInterface } from "../interfaces/unit.interface";
import { UnitEntity } from "../domain/entities/unit.entity";

interface ApiResponseProduct {
  id: string | number;
  name: string;
  description: string;
  product_type_id: number;
  unit_id: string | null;
  unit?: UnitApiModel | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

interface ApiResponseData {
  data: ApiResponseProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

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

      const apiResponse = response.data as ApiResponseData;
      return {
        data: apiResponse.data.map((product) => this.toDomainModel(product)),
        total: apiResponse.pagination.total,
        page: apiResponse.pagination.page,
        limit: apiResponse.pagination.limit,
        totalPages: apiResponse.pagination.total_pages,
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

      const apiResponse = response.data as { data: ApiResponseProduct[] };
      if (!Array.isArray(apiResponse.data) || apiResponse.data.length === 0) {
        return null;
      }
      const found = apiResponse.data.find(
        (p) =>
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

      const apiResponse = response.data as { data: ApiResponseProduct[] };
      if (!Array.isArray(apiResponse.data) || apiResponse.data.length === 0) {
        return [];
      }

      return apiResponse.data
        .filter((p) => p.deleted_at === null || p.deleted_at === undefined)
        .map((product) => this.toDomainModel(product));
    } catch (error) {
      console.error(`Error finding products by product_type_id '${product_type_id}':`, error);
      return [];
    }
  }

  async findByUnitId(unit_id: string): Promise<ProductEntity[]> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { unit_id },
      });

      const apiResponse = response.data as { data: ApiResponseProduct[] };
      if (!Array.isArray(apiResponse.data) || apiResponse.data.length === 0) {
        return [];
      }

      return apiResponse.data
        .filter((p) => p.deleted_at === null || p.deleted_at === undefined)
        .map((product) => this.toDomainModel(product));
    } catch (error) {
      console.error(`Error finding products by unit_id '${unit_id}':`, error);
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

  private toDomainModel(product: ApiResponseProduct): ProductEntity {
     const unit = product.unit ? this.toUnitEntity(product.unit) : undefined;
    return new ProductEntity(
      product.id?.toString() ?? "",
      product.name ?? "",
      product.description ?? "",
      product.product_type_id ?? 0,
      product.unit_id ?? null,
      unit,
      product.status ?? "active",
      product.created_at ?? "",
      product.updated_at ?? "",
      product.deleted_at ?? null
    );
  }

   private toUnitEntity(unit: UnitInterface): UnitEntity {
      return new UnitEntity(
        unit.id.toString(),
        unit.name ?? '',
        unit.created_at ?? "",
        unit.updated_at ?? ""
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
