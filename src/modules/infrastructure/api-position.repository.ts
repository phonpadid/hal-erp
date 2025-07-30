import type { PositionRepository } from "@/modules/domain/repository/position.repository";
import { PositionEntity } from "@/modules/domain/entities/position.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { CreatePositionDTO, UpdatePositionDTO } from "@/modules/application/dtos/position.dto";

export class ApiPositionRepository implements PositionRepository {
  private readonly baseUrl = "/positions";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<PositionEntity>> {
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
        data: response.data.data.map((position: any) => this.toDomainModel(position)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch positions list");
    }
  }

  async findById(id: string): Promise<PositionEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find position with id ${id}`);
    }
  }

  async findByName(name: string): Promise<PositionEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { name, limit: 5 },
      });

      const data = response.data.data;
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }
      const found = data.find(
        (p: any) =>
          p.name === name && (p.deleted_at === null || p.deleted_at === undefined)
      );
      if (!found) return null;

      return this.toDomainModel(found);
    } catch (error) {
      console.error(`Error finding position by name '${name}':`, error);
      return null;
    }
  }

  async create(positionData: CreatePositionDTO): Promise<PositionEntity> {
    try {
      const response = await api.post(this.baseUrl, positionData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create position");
    }
  }

  async update(id: string, updatePositionDTO: UpdatePositionDTO): Promise<PositionEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, updatePositionDTO);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update position with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete position with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/${id}/restore`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to restore position with id ${id}`);
    }
  }

  private toDomainModel(position: any): PositionEntity {
    return new PositionEntity(
      position.id?.toString() ?? "",
      position.name ?? "",
      position.created_at ?? "",
      position.updated_at ?? "",
      position.deleted_at ?? null
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
