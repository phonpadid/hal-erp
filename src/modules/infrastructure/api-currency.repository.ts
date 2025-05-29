import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { CurrencyRepository } from "../domain/repository/currency.repository";
import { CurrencyEntity } from "../domain/entities/currency.entity";
import type { CurrencyApiModel } from "../interfaces/currency.interface";
export class ApiCurrencyRepository implements CurrencyRepository {
  async create(inputs: CurrencyEntity[]): Promise<CurrencyEntity[] | CurrencyEntity> {
      const payload = { currency: inputs.map(this.toApiModel) };
      const response = await api.post("/currencies", payload);
      const data = response.data.data;
      if (Array.isArray(data)) {
        return data.map(this.toDomainModel);
      } else if (data) {
        return this.toDomainModel(data);
      } else {
        throw new Error("No data returned from create API");
      }
  }
  async findById(id: string): Promise<CurrencyEntity | null> {
    try {
      const response = (await api.get(`/currencies/${id}`)) as {
        data: ApiResponse<CurrencyApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find with id ${id}`);
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<CurrencyEntity>> {
    try {
      const response = await api.get("/currencies", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      }) as { data: ApiListResponse<CurrencyApiModel> };
      const { pagination } = response.data;
      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch list");
    }
  }


  async update(id: string, input: CurrencyEntity): Promise<CurrencyEntity> {
    try {
      const response = (await api.put(`/currencies/${id}`, this.toApiModel(input))) as {
        data: ApiResponse<CurrencyApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update with id ${input.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/currencies/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete with id ${id}`);
    }
  }


  private toApiModel(input: CurrencyEntity): CurrencyApiModel {
    return {
      id: input.getId() ?? "",
      name: input.getName(),
      code: input.getCode(),
      created_at: input.getCreatedAt() ?? "",
      updated_at: input.getUpdatedAt() ?? "",
    };
  }

  private toDomainModel(data: CurrencyApiModel): CurrencyEntity {
    return new CurrencyEntity(
      data.id,
      data.name,
      data.code || "",
      data.created_at || "",
      data.updated_at || "",
    );
  }

  private handleApiError<T>(error: unknown, defaultMessage: string): T {
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
