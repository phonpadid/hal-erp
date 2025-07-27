import type { CategoryRepository } from "@/modules/domain/repository/category.repository";
import { CategoryEntity } from "@/modules/domain/entities/categories.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "@/modules/application/dtos/category.dto";

export class ApiCategoryRepository implements CategoryRepository {
  private readonly baseUrl = "/categories";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CategoryEntity>> {
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
        data: response.data.data.map((category: any) => this.toDomainModel(category)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch categories list");
    }
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find category with id ${id}`);
    }
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { name, limit: 5 },
      });

      const data = response.data.data;
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }
      const found = data.find(
        (c: any) =>
          c.name === name && (c.deleted_at === null || c.deleted_at === undefined)
      );
      if (!found) return null;

      return this.toDomainModel(found);
    } catch (error) {
      console.error(`Error finding category by name '${name}':`, error);
      return null;
    }
  }

  async create(categoryData: CreateCategoryDTO): Promise<CategoryEntity> {
    try {
      const response = await api.post(this.baseUrl, categoryData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create category");
    }
  }

  async update(id: string, updateCategoryDTO: UpdateCategoryDTO): Promise<CategoryEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, updateCategoryDTO);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update category with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete category with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/${id}/restore`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to restore category with id ${id}`);
    }
  }

  private toDomainModel(category: any): CategoryEntity {
    return new CategoryEntity(
      category.id?.toString() ?? "",
      category.name ?? "",
      category.created_at ?? "",
      category.updated_at ?? "",
      category.deleted_at ?? null
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
