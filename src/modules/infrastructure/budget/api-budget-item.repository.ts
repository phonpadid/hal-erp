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
import { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";


export class ApiBudgetItemRepository implements BudgetItemRepository {
  private readonly baseUrl = "/budget-items";

  async findAll(
    params: PaginationParams,
    budget_account_id?: number
  ): Promise<PaginatedResult<BudGetItemEntity>> {
    try {
      const response = await api.get(this.baseUrl, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          sort_by: params.sortBy,
          sortDirection: params.sortDirection,
          budget_account_id: budget_account_id
        },
      });
      return {
        data: response.data.data.map((budGetItem: BudgetItemInterface) =>
          this.toDomainModel(budGetItem)
        ),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.totalPages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch budget items list");
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
  // In the file api-budget-item.repository.ts
  async getReport(
    params: PaginationParams,
    budgetType: string,
    departmentId?: number
  ): Promise<PaginatedResult<BudGetItemEntity>> {
    try {
      const response = await api.get(`${this.baseUrl}/report`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          sort_by: params.sortBy,
          sort_direction: params.sortDirection,
          ...(budgetType === "expenditure" && { expenditure: true }),
          ...(budgetType === "advance" && { advance: true }),
          ...(departmentId && { department_id: departmentId }),
        },
      });
      return {
        data: Array.isArray(response.data.data)
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.data.data.map((item: any) => this.toDomainModel(item))
          : [],
        total: response.data.pagination?.total || 0,
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 10,
        totalPages: response.data.pagination?.total_pages || 1,
      };
    } catch (error) {
      console.error("API Error in getReport:", error);
      this.handleApiError(error, "Failed to fetch budget item report.");
    }
  }

  async budgetItemReportId(id: string): Promise<BudGetItemEntity> {
    try {
      const response = await api.get(`${this.baseUrl}/item/${id}`);
      return response.data.data;
    } catch (error) {
      this.handleApiError(error, `Failed to fetch budget item report for account ID ${id}`);
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
    if (!budGet) {
      return new BudGetItemEntity("", "", "", 0, 0, 0, "", "", "", null);
    }
    const id = budGet.id ? String(budGet.id) : "";
    const budgetAccountId = budGet.budget_account_id ? String(budGet.budget_account_id) : "";
    const name = budGet.name || "";
    const allocatedAmount = Number(budGet.allocated_amount || 0);
    const usedAmount = Number(budGet.use_amount || 0);
    const balanceAmount = Number(budGet.balance_amount || 0);
    const description = budGet.description || "";
    const createdAt = budGet.created_at || "";
    const updatedAt = budGet.updated_at || "";
    const deletedAt = budGet.deleted_at || null;
    let budgetAccountEntity = undefined;
    if (budGet.budget_account) {
      const ba = budGet.budget_account;
      budgetAccountEntity = new BudGetAccountsEntity(
        ba.id ? String(ba.id) : "",
        ba.code || "",
        ba.name || "",
        ba.departmentId ? String(ba.departmentId) : "",
        ba.fiscal_year ? String(ba.fiscal_year) : "",
        Number(ba.allocated_amount || 0),
        Number(ba.balance_amount || 0),
        Number(ba.used_amount||0),
        Number(ba.total_budget||0),
        ba.type || "",
        ba.created_at || "",
        ba.updated_at || "",
        ba.deleted_at || ""
      );
    }

    return new BudGetItemEntity(
      id,
      budgetAccountId,
      name,
      allocatedAmount,
      usedAmount,
      balanceAmount,
      description,
      createdAt,
      updatedAt,
      deletedAt,
      budgetAccountEntity
    );
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      // โค้ดที่อาจทำให้เกิดข้อผิดพลาดคือการเข้าถึง property ที่ไม่มีอยู่จริง
      const serverMessage = axiosError.response.data?.message;
      throw new Error(`${defaultMessage}: ${serverMessage || "Unknown server error."}`);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      const errorMessage = (error as Error).message;
      throw new Error(`${defaultMessage}: ${errorMessage || "Unknown error."}`);
    }
  }
}
