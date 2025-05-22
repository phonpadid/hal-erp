import type { ApiListResponse } from "../shared/repondata";
import type { CategoryApiModel } from "../interfaces/category.interface";
import type { ApiResponse } from "../shared/messageApi";
import { Category } from "../domain/entities/categories.entities";
import type { CategoryRepository } from "../domain/repository/category.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiCategoryRepository implements CategoryRepository {
  async create(category: Category): Promise<Category> {
    try {
      const response = (await api.post("/category", this.toApiModel(category))) as {
        data: ApiResponse<CategoryApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create category");
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const response = (await api.get(`/category/${id}`)) as {
        data: ApiResponse<CategoryApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find category with id ${id}`);
    }
  }

  async findByName(name: string): Promise<Category | null> {
    try {
      const response = (await api.get("/category", {
        params: { name },
      })) as { data: ApiListResponse<CategoryApiModel> };

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error(`Error finding category by name '${name}':`, error);
      return null;
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Category>> {
    try {
      const response = (await api.get("/category", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      })) as { data: ApiListResponse<CategoryApiModel> };

      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: Math.ceil(response.data.total / response.data.limit),
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch categories list");
    }
  }

  async update(category: Category): Promise<Category> {
    try {
      const response = (await api.put(
        `/category/${category.getId()}`,
        this.toApiModel(category)
      )) as { data: ApiResponse<CategoryApiModel> };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update category with id ${category.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/category/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete category with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`/category/${id}/restore`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to restore category with id ${id}`);
    }
  }

  private toApiModel(category: Category): CategoryApiModel {
    return {
      id: parseInt(category.getId(), 10),
      name: category.getName(),
      created_at: category.getCreatedAt().toISOString(),
      updated_at: category.getUpdatedAt().toISOString(),
    };
  }

  private toDomainModel(data: CategoryApiModel): Category {
    return new Category(
      data.id.toString(),
      data.name,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const statusCode = axiosError.response.status;
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(`API Error (${statusCode}): ${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
