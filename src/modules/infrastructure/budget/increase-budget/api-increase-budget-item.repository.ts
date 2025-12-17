import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import { IcraseDetailEntity } from "@/modules/domain/entities/budget/increase/increase-detail.entity";
import type { IncreaseBudgetItemRepository } from "@/modules/domain/repository/budget/increase-budget/increase-buget-item.repository";
import type {
  IncreaseBudgetAccountDetailCreateDTO,
  IncreaseBudgetAccountDetailUpdateDTO,
  IncreaseDetailDTO,
} from "@/modules/application/dtos/budget/increase-budget/increase-detail.dto";
import { BudGetItemEntity } from "@/modules/domain/entities/budget/budget-items.entities";
import { BudGetAccountsEntity } from "@/modules/domain/entities/budget/budget-accounts.entities";

export class ApiIncreaseBudgetItemRepository implements IncreaseBudgetItemRepository {
  private readonly baseUrl = "/increase-budget-details";

  async findAll(
    id: string,
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<IcraseDetailEntity>> {
    try {
      const response = await api.get(this.baseUrl + "/" + id, {
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
        data: response.data.data.map((data: IncreaseDetailDTO) => this.toDomainModel(data)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch budget accounts list");
    }
  }

  async findById(id: string): Promise<IcraseDetailEntity | null> {
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

  async create(
    id: number,
    input: IncreaseBudgetAccountDetailCreateDTO
  ): Promise<IcraseDetailEntity> {
    try {
      const response = await api.post(this.baseUrl + "/" + id, {
        ...input,
      });

      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create budget account");
    }
  }

  async update(
    id: string,
    budgetAccountData: IncreaseBudgetAccountDetailUpdateDTO
  ): Promise<IcraseDetailEntity> {
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

  private toDomainModel(input: IncreaseDetailDTO): IcraseDetailEntity {
    const res = new IcraseDetailEntity(
      input.id,
      input.increase_budget_id,
      input.budget_item_id,
      input.allocated_amount,
      null, // increase_budget - keeping as null since not provided in input
      input.budget_item
        ? new BudGetItemEntity(
            input.budget_item.id.toString(), // id
            String(input.budget_item.butget_account_id), // budget_account_id
            input.budget_item.name ?? "", // name
            Number(input.budget_item.allocated_amount), // allocated_amount
            Number(input.budget_item.use_amount), // allocated_amount
            Number(input.budget_item.balance_amount), // allocated_amount
            input.budget_item.description ?? "", // description
            input.budget_item.created_at ?? "", // created_at
            input.budget_item.updated_at ?? "", // updated_at
            null, // deleted_at
            // budget_account (last parameter) - Create BudGetAccountsEntity instance
            input.budget_account || input.budget_item?.budget_account
              ? new BudGetAccountsEntity(
                  (input.budget_account?.id || input.budget_item?.budget_account?.id)?.toString() ||
                    "",
                  input.budget_account?.code || input.budget_item?.budget_account?.code || "",
                  input.budget_account?.name || input.budget_item?.budget_account?.name || "",
                  input.budget_account?.fiscal_year ||
                    input.budget_item?.budget_account?.fiscal_year,
                  input.budget_account?.allocated_amount ||
                    input.budget_item?.budget_account?.allocated_amount ||
                    0,
                  input.budget_account?.balance_amount ||
                    input.budget_item?.budget_account?.balance_amount ||
                    0,
                  input.budget_account?.used_amount ||
                    input.budget_item?.budget_account?.used_amount ||
                    0,
                  input.budget_account?.total_budget ||
                    input.budget_item?.budget_account?.total_budget ||
                    0,
                  input.budget_account?.increase_amount ||
                    input.budget_item?.budget_account?.increase_amount ||
                    0,
                  input.budget_account?.departmentId ||
                    input.budget_item?.budget_account?.departmentId ||
                    "",
                  input.budget_account?.description ||
                    input.budget_item?.budget_account?.description ||
                    null,
                  input.budget_account?.created_at ||
                    input.budget_item?.budget_account?.created_at ||
                    "",
                  input.budget_account?.updated_at ||
                    input.budget_item?.budget_account?.updated_at ||
                    "",
                  "" // deleted_at
                )
              : undefined
          )
        : null,
      input.created_at ?? "",
      input.updated_at ?? ""
    );

    // console.log('toDomainModel result:', res);
    return res;
  }

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
