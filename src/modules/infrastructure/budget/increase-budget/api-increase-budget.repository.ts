import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { IncreaseBudgetRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget.repository";
import { IncreaseBudGetAccountsEntity } from "@/modules/domain/entities/budget/increase/increase-budget.entity";
import type { IncreaseBudgetAccountCreateDTO, IncreaseBudgetAccountDTO, IncreaseBudgetAccountUpdateDTO } from "@/modules/application/dtos/budget/increase-budget/increase-budget.dto";
import { IcraseDetailEntity } from "@/modules/domain/entities/budget/increase/increase-detail.entity";
import { IncreaseBudgetFileEntity } from "@/modules/domain/entities/budget/increase/increase-budget-file.entity";
import { UserEntity } from "@/modules/domain/entities/user.entities";
import { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";

export class ApiIncreaseBudgetRepository implements IncreaseBudgetRepository {
  private readonly baseUrl = "/increase-budgets";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<IncreaseBudGetAccountsEntity>> {
    try {
      const response = await api.get(this.baseUrl, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          date: params.date || "",
          sort_by: params.sortBy,
          sortDirection: params.sortDirection,
          include_deleted: includeDeleted,
        },
      });
      return {
        data: response.data.data.map((data: IncreaseBudgetAccountDTO) =>
          this.toDomainModel(data)
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

  async findById(id: string): Promise<IncreaseBudGetAccountsEntity | null> {
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

  async create(input: IncreaseBudgetAccountCreateDTO): Promise<IncreaseBudGetAccountsEntity> {
    try {
      const response = await api.post(this.baseUrl, {
        ...input,
      });

      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create budget account");
    }
  }

  async update(
    id: string,
    budgetAccountData: IncreaseBudgetAccountUpdateDTO
  ): Promise<IncreaseBudGetAccountsEntity> {
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

  private toDomainModel(input: IncreaseBudgetAccountDTO): IncreaseBudGetAccountsEntity {
    return new IncreaseBudGetAccountsEntity(
      input.id?.toString() || "",
      input.budget_account_id,
      input.allocated_amount,
      input.description ?? "",
      input.file_name ?? "",
      input.user_id || null,
      (input.increase_budget_details || []).map(
        detail =>
          new IcraseDetailEntity(
            detail.id?.toString() || "",
            detail.increase_budget_id ?? 0,
            detail.budget_item_id,
            Number(detail.allocated_amount) || 0
          )
      ),
      input.budget_account
        ? new BudGetAccountsEntity(
            input.budget_account.id?.toString() || "",
            input.budget_account.code ?? "",
            input.budget_account.name ?? "",
            input.budget_account.fiscal_year ?? "",
            input.budget_account.allocated_amount ?? 0,
            input.budget_account.balance_amount ?? 0,
            input.budget_account.used_amount ?? 0,
            input.budget_account.total_budget ?? 0,
            input.budget_account.departmentId ?? "",
            input.budget_account.description ?? "",
            input.budget_account.created_at ?? "",
            input.budget_account.updated_at ?? "",
            ''
          )
        : null,
      input.created_by_user
        ? new UserEntity(
            input.created_by_user.id?.toString() || "",
            input.created_by_user.username ?? "",
            input.created_by_user.email ?? "",
            input.created_by_user.roleIds ?? [],
            input.created_by_user.roles ?? [],
            input.created_by_user.permissionIds ?? [],
            input.created_by_user.created_at ?? "",
            input.created_by_user.updated_at ?? "",
            input.created_by_user.deleted_at ?? null,
            input.created_by_user.password ?? undefined,
            input.created_by_user.tel ?? undefined
          )
        : null,
      input.increase_budget_files
        ? input.increase_budget_files.map(
            file =>
              new IncreaseBudgetFileEntity(
                file.id ?? '',
                file.increase_budget_id ?? 0,
                file.file_name ?? '',
                file.file_name_url ?? ""
              )
          )
        : [],

      input.created_at || "",
      input.updated_at ?? ""
    );
  }



  // private toDomainDetailModel(input: IncreaseBudgetAccountDetailCreateDTO): IcraseDetailEntity {
  //   return new IcraseDetailEntity(
  //     input.id?.toString() || "",
  //     input.increase_budget_id ?? 0,
  //     input.budget_item_id,
  //     input.allocated_amount ?? ""
  //   );
  // }


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
