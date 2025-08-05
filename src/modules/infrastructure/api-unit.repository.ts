/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UnitRepository } from "@/modules/domain/repository/unit.repository";
import { UnitEntity } from "@/modules/domain/entities/unit.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { CreateUnitDTO, UpdateUnitDTO } from "@/modules/application/dtos/unit.dto";

export class ApiUnitRepository implements UnitRepository {
  private readonly baseUrl = "/units";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<UnitEntity>> {
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
        data: response.data.data.map((unit: any) => this.toDomainModel(unit)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch units list");
    }
  }

  async findById(id: string): Promise<UnitEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find unit with id ${id}`);
    }
  }

  async findByName(name: string): Promise<UnitEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { name, limit: 5 },
      });

      const data = response.data.data;
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }
      const found = data.find(
        (u: any) =>
          u.name === name && (u.deleted_at === null || u.deleted_at === undefined)
      );
      if (!found) return null;

      return this.toDomainModel(found);
    } catch (error) {
      console.error(`Error finding unit by name '${name}':`, error);
      return null;
    }
  }

  async create(unitData: CreateUnitDTO): Promise<UnitEntity> {
    try {
      const response = await api.post(this.baseUrl, unitData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create unit");
    }
  }

  async update(id: string, updateUnitDTO: UpdateUnitDTO): Promise<UnitEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, updateUnitDTO);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update unit with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete unit with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/${id}/restore`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to restore unit with id ${id}`);
    }
  }

  private toDomainModel(unit: any): UnitEntity {
    return new UnitEntity(
      unit.id?.toString() ?? "",
      unit.name ?? "",
      unit.created_at ?? "",
      unit.updated_at ?? "",
      unit.deleted_at ?? null
    );
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(serverMessage);
    } else if (axiosError.request) {
      throw new Error(
        "Network Error: The request was made but no response was received. Please check your connection."
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
