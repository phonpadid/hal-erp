import type {
  BudgetItemInterface,
  CreateBudgetItemInterface,
  UpdateBudgetItemInterface,
} from "@/modules/interfaces/budget/budget-item.interface";
import { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";
import type { BudgetItemRepository } from "@/modules/domain/repository/budget/budget-item.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiBudgetItemRepository implements BudgetItemRepository {
  private readonly baseUrl = "/budget-items";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetItemEntity>> {
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
        data: response.data.data.map((budGetItem: BudgetItemInterface) =>
          this.toDomainModel(budGetItem)
        ),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: Math.ceil(response.data.total / response.data.limit),
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch budGetAccountss list");
    }
  }

  async findByBudgetAccountId(
    budgetAccountId: string,
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetItemEntity>> {
    try {
      const response = await api.get(`${this.baseUrl}/by-account/${budgetAccountId}`, {
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
        data: response.data.data.map((budGetItem: BudgetItemInterface) =>
          this.toDomainModel(budGetItem)
        ),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: Math.ceil(response.data.total / response.data.limit),
      };
    } catch (error) {
      this.handleApiError(error, `Failed to fetch budget items for account ID ${budgetAccountId}`);
    }
  }

  async findById(id: string): Promise<BudGetItemEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find budGetAccounts with id ${id}`);
    }
  }
  async create(budGetItem: CreateBudgetItemInterface): Promise<BudGetItemEntity> {
    try {
      const response = await api.post(this.baseUrl, budGetItem);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create budGetAccounts");
    }
  }

  async update(id: string, budGetItem: UpdateBudgetItemInterface): Promise<BudGetItemEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, budGetItem);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update budGetAccounts with id ${id}`);
    }
  }
  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete budGetAccounts with id ${id}`);
    }
  }
  private toDomainModel(budGet: BudgetItemInterface): BudGetItemEntity {
    return new BudGetItemEntity(
      budGet.id.toString(),
      budGet.budget_account_id.toString(),
      budGet.name,
      budGet.allocated_amount,
      budGet.created_at || "",
      budGet.updated_at || "",
      budGet.deleted_at || null,
      budGet.budget_item_details
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
