import type {
  BudgetAccountInterface,
  CreateBudgetAccountInterface,
  UpdateBudgetAccountInterface,
} from "@/modules/interfaces/budget/budget-account.interface";
import { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";
import type { BudgetAccountsRepository } from "@/modules/domain/repository/budget/budget-accounts.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";
import { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";

export class ApiBudgetAccountsRepository implements BudgetAccountsRepository {
  private readonly baseUrl = "/budget-accounts";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<BudGetAccountsEntity>> {
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
        data: response.data.data.map((budGetAccounts: BudgetAccountInterface) =>
          this.toDomainModel(budGetAccounts)
        ),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch budget accounts list");
    }
  }

  async findById(id: string): Promise<BudGetAccountsEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find budget account with id ${id}`);
    }
  }

  async create(budgetAccountData: CreateBudgetAccountInterface): Promise<BudGetAccountsEntity> {
    try {
      const response = await api.post(this.baseUrl, {
        ...budgetAccountData,
      });

      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create budget account");
    }
  }

  async update(
    id: string,
    budgetAccountData: UpdateBudgetAccountInterface
  ): Promise<BudGetAccountsEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, {
        ...budgetAccountData,
      });

      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update budget account with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete budget account with id ${id}`);
    }
  }

  private toDomainModel(budgetAccount: BudgetAccountInterface): BudGetAccountsEntity {
    return new BudGetAccountsEntity(
      budgetAccount.id.toString(),
      budgetAccount.code,
      budgetAccount.name,
      budgetAccount.fiscal_year,
      budgetAccount.allocated_amount,
      budgetAccount.department_id?.toString(),
      budgetAccount.created_at || "",
      budgetAccount.updated_at || "",
      budgetAccount.deleted_at || null,
      budgetAccount.department
    );
  }
  private toDepartmentEntity(departmentData: DepartmentApiModel): DepartmentEntity {
    return new DepartmentEntity(
      departmentData.id.toString(),
      departmentData.name,
      departmentData.code ?? "",
      departmentData.created_at ?? "",
      departmentData.updated_at ?? ""
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
