import type {
  BudgetItemDetailsInterface,
  CreateBudgetItemDetailsInterface,
  UpdateBudgetItemDetailsInterface,
} from "@/modules/interfaces/budget/budget-item-details.interface";
import { BudGetItemDetailsEntity } from "@/modules/domain/entities/budget/budget-item-details.entities";
import type { BudgetItemDetailsRepository } from "@/modules/domain/repository/budget/budget-item-details.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiBudgetItemDetailsRepository implements BudgetItemDetailsRepository {
  private readonly baseUrl = "/budget-item-details";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetItemDetailsEntity>> {
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
        data: response.data.data.map((budGetItemDetails: BudgetItemDetailsInterface) =>
          this.toDomainModel(budGetItemDetails)
        ),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: Math.ceil(response.data.total / response.data.limit),
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch budGetItemDetailss list");
    }
  }

  async findById(id: string): Promise<BudGetItemDetailsEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find budGetItemDetails with id ${id}`);
    }
  }
  async create(
    budGetItemDetails: CreateBudgetItemDetailsInterface
  ): Promise<BudGetItemDetailsEntity> {
    try {
      const response = await api.post(this.baseUrl, budGetItemDetails);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create budGetItemDetails");
    }
  }

  async update(
    id: string,
    budGetItemDetails: UpdateBudgetItemDetailsInterface
  ): Promise<BudGetItemDetailsEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, budGetItemDetails);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update budGetItemDetails with id ${id}`);
    }
  }
  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete budGetItemDetails with id ${id}`);
    }
  }
  private toDomainModel(budGet: BudgetItemDetailsInterface): BudGetItemDetailsEntity {
    return new BudGetItemDetailsEntity(
      budGet.id.toString(),
      budGet.name,
      budGet.budget_item_id.toString(),
      budGet.description || "",
      budGet.province_id ? budGet.province_id.toString() : undefined,
      budGet.allocated_amount,
      budGet.created_at || "",
      budGet.updated_at || "",
      budGet.deleted_at || null
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
