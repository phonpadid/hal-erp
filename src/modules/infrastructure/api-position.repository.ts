import type { ApiListResponse } from "../shared/repondata";
import type { PositionApiModel } from "../interfaces/position.interface";
import type { ApiResponse } from "../shared/messageApi";
import { Position } from "../domain/entities/position.entities";
import type { PositionRepository } from "../domain/repository/position.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiPositionRepository implements PositionRepository {
  async create(position: Position): Promise<Position> {
    try {
      const response = (await api.post("/position", this.toApiModel(position))) as {
        data: ApiResponse<PositionApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create position");
    }
  }

  async findById(id: string): Promise<Position | null> {
    try {
      const response = (await api.get(`/position/${id}`)) as {
        data: ApiResponse<PositionApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find position with id ${id}`);
    }
  }

  async findByName(name: string): Promise<Position | null> {
    try {
      const response = (await api.get("/position", {
        params: { name },
      })) as { data: ApiListResponse<PositionApiModel> };

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error(`Error finding position by name '${name}':`, error);
      return null;
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Position>> {
    try {
      const response = (await api.get("/position", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      })) as { data: ApiListResponse<PositionApiModel> };

      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: Math.ceil(response.data.total / response.data.limit),
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch positions list");
    }
  }

  async update(position: Position): Promise<Position> {
    try {
      const response = (await api.put(
        `/position/${position.getId()}`,
        this.toApiModel(position)
      )) as { data: ApiResponse<PositionApiModel> };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update position with id ${position.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/position/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete position with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`/position/${id}/restore`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to restore position with id ${id}`);
    }
  }

  private toApiModel(position: Position): PositionApiModel {
    return {
      id: parseInt(position.getId(), 10),
      name: position.getName(),
      created_at: position.getCreatedAt().toISOString(),
      updated_at: position.getUpdatedAt().toISOString(),
    };
  }

  private toDomainModel(data: PositionApiModel): Position {
    return new Position(
      data.id.toString(),
      data.name,
      new Date(data.created_at),
      new Date(data.updated_at)
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
