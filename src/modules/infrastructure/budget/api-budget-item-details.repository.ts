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
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch budget item details list");
    }
  }

  async findByBudgetItemId(
    budgetItemId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<BudGetItemDetailsEntity>> {
    try {
      const response = await api.get(`${this.baseUrl}/budget-item-id/${budgetItemId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          column: "id",
          sort_order: "DESC",
          search: params.search || "",
        },
      });

      return {
        data: response.data.data.map((item: BudgetItemDetailsInterface) =>
          this.toDomainModel(item)
        ),
        total: response.data.pagination?.total || 0,
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 10,
        totalPages: response.data.pagination?.total_pages || 1,
      };
    } catch (error) {
      console.error(`Error in findByBudgetItemId for item ${budgetItemId}:`, error);
      this.handleApiError(error, `Failed to fetch budget item details for item ${budgetItemId}`);
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
      this.handleApiError(error, `Failed to find budget item details with id ${id}`);
    }
  }

  async create(
    budGetItemDetails: CreateBudgetItemDetailsInterface
  ): Promise<BudGetItemDetailsEntity> {
    try {
      const response = await api.post(`${this.baseUrl}/${budGetItemDetails.budget_item_id}`, {
        name: budGetItemDetails.name,
        provinceId: Number(budGetItemDetails.province_id) || "",
        allocated_amount: Number(budGetItemDetails.allocated_amount) || 0,
        description: budGetItemDetails.description || "",
      });
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create budget item details");
    }
  }

  async update(
    id: string,
    budGetItemDetails: UpdateBudgetItemDetailsInterface
  ): Promise<BudGetItemDetailsEntity> {
    try {
      const dataToSend = {
        ...budGetItemDetails,
        description: budGetItemDetails.description || "",
      };

      const response = await api.put(`${this.baseUrl}/${id}`, dataToSend);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update budget item details with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete budget item details with id ${id}`);
    }
  }

  private toDomainModel(budGet: BudgetItemDetailsInterface): BudGetItemDetailsEntity {
    return new BudGetItemDetailsEntity(
      budGet.id.toString(),
      budGet.name,
      budGet.budget_item_id.toString(),
      budGet.description || "",
      budGet.province_id.toString(),
      budGet.province
        ? {
            id: budGet.province.id,
            name: budGet.province.name,
            created_at: budGet.province.created_at,
            updated_at: budGet.province.updated_at,
          }
        : null,
      budGet.allocated_amount.toString(),
      budGet.created_at,
      budGet.updated_at,
      budGet.deleted_at || null
    );
  }

  // ... rest of the repository code remains the same

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;

      throw new Error(`${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
