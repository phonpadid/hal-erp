import type { ApiListResponse } from "./../shared/repondata";
import type { UnitApiModel } from "./../interfaces/unit.interface";
import type { ApiResponse } from "./../shared/messageApi";
import { Unit } from "../domain/entities/unit.entities";
import type { UnitRepository } from "../domain/repository/unit.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiUnitRepository implements UnitRepository {
  async create(input: Unit): Promise<Unit> {
    try {
      const response = (await api.post("/units", this.toApiModel(input))) as {
        data: ApiResponse<UnitApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create unit");
    }
  }

  async findById(id: string): Promise<Unit | null> {
    try {
      const response = (await api.get(`/units/${id}`)) as { data: ApiResponse<UnitApiModel> };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find unit with id ${id}`);
    }
  }

  async findByName(name: string): Promise<Unit | null> {
    try {
      const response = (await api.get("/units", {
        params: { name },
      })) as { data: ApiListResponse<UnitApiModel> };

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {

      console.error(`Error finding unit by name '${name}':`, error);
      return null;
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Unit>> {
    try {
      const response = (await api.get("/units", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      })) as { data: ApiListResponse<UnitApiModel> };

      const data = response.data.data.map((item) => this.toDomainModel(item))
      return {
        data: data,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: Math.ceil(response.data.total / response.data.limit),
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch units list");
    }
  }

  async update(input: Unit): Promise<Unit> {
    try {
      const response = (await api.put(`/units/${input.getId()}`, this.toApiModel(input))) as {
        data: ApiResponse<UnitApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update unit with id ${input.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/units/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete unit with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`/units/${id}/restore`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to restore unit with id ${id}`);
    }
  }

  private toApiModel(input: Unit): UnitApiModel {
    return {
      id: parseInt(input.getId(), 10),
      name: input.getName(),
      created_at: input.getCreatedAt().toString(),
      updated_at: input.getUpdatedAt().toString(),
    };
  }

  private toDomainModel(data: UnitApiModel): Unit {
    return new Unit(
      data.id.toString(),
      data.name,
      data.created_at.toString(),
      data.updated_at.toString(),
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
