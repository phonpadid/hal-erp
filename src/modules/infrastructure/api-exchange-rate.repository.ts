import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { ApiListResponse } from "@/modules/shared/repondata";
import { CurrencyEntity } from "../domain/entities/currency.entity";
import type { CurrencyApiModel } from "../interfaces/currency.interface";
import type { ExchangeRateRepository } from "../domain/repository/exchange-rate.repository";
import { ExchangeRateEntity } from "../domain/entities/exchange-rate.entities";
import type { ExchangeRateApiModel } from "../interfaces/exchange-rate.interface";
export class ApiExchangeRateRepository implements ExchangeRateRepository {
  async create(inputs: ExchangeRateEntity[]): Promise<ExchangeRateEntity[] | ExchangeRateEntity> {
    // const payload = { exchange_rate: inputs.map(this.toApiModel) };
    const payload = { exchange_rate: inputs.map(input => this.toApiModel(input)) };
    const response = await api.post("/exchange-rates", payload);
    const data = response.data.data;
    if (Array.isArray(data)) {
      return data.map(item => this.toDomainModel(item));
    } else if (data) {
      return this.toDomainModel(data);
    } else {
      throw new Error("No data returned from create API");
    }
  }
  async findById(id: string): Promise<ExchangeRateEntity | null> {
    try {
      const response = (await api.get(`/exchange-rates/${id}`)) as {
        data: ApiResponse<ExchangeRateApiModel>;
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
  ): Promise<PaginatedResult<ExchangeRateEntity>> {
    try {
      const response = await api.get("/exchange-rates", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.filter && { from_currency_id: params.filter.from_currency_id, to_currency_id: params.filter.to_currency_id }),
        },
      }) as { data: ApiListResponse<ExchangeRateApiModel> };
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


  async update(id: string, input: ExchangeRateEntity): Promise<ExchangeRateEntity> {
    try {

      const response = (await api.put(`/exchange-rates/${id}`, this.toApiModel(input))) as {
        data: ApiResponse<ExchangeRateApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update with id ${input.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/exchange-rates/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete with id ${id}`);
    }
  }


  private toApiModel(input: ExchangeRateEntity): ExchangeRateApiModel {
    return {
      id: input.getId() ?? "",
      from_currency_id: input.getFromCurrencyId(),
      to_currency_id: input.getToCurrencyId(),
      rate: input.getRate(),
      is_active: input.getIsActive() ?? false,
      created_at: input.getCreatedAt() ?? "",
      updated_at: input.getUpdatedAt() ?? "",
    };
  }

  private toDomainModel(data: ExchangeRateApiModel): ExchangeRateEntity {
    const from_currency = data?.from_currency ? this.toCurrencyEntity(data?.from_currency) : undefined;
    const to_currency = data?.to_currency ? this.toCurrencyEntity(data?.to_currency) : undefined;
    return new ExchangeRateEntity(
      data.id,
      data.from_currency_id,
      data.to_currency_id,
      data.rate,
      data.is_active || false,
      from_currency,
      to_currency,
      data.created_at || "",
      data.updated_at || "",
    );
  }
  //map currency
  private toCurrencyEntity(input: CurrencyApiModel): CurrencyEntity {
    return new CurrencyEntity(
      input.id,
      input.name,
      input.code || "",
      input.created_at || "",
      input.updated_at || "",
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
