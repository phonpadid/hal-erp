import type { ApiListResponse } from "../shared/repondata";
import type { PositionApiModel } from "../interfaces/position.interface";
import type { ApiResponse } from "../shared/messageApi";
import { Position } from "../domain/entities/position.entity";
import type { PositionRepository } from "../domain/repository/position.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiPositionRepository implements PositionRepository {
  async create(input: Position): Promise<Position> {
    try {
      const response = (await api.post("/positions", this.toApiModel(input))) as {
        data: ApiResponse<PositionApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create position");
    }
  }

  async findById(id: string): Promise<Position | null> {
    try {
      const response = (await api.get(`/positions/${id}`)) as {
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
      const response = (await api.get("/positions", {
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
      const response = (await api.get("/positions", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      })) as { data: ApiListResponse<PositionApiModel> };

      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch positions list");
    }
  }

  async update(input: Position): Promise<Position> {
    try {
      const response = (await api.put(
        `/positions/${input.getId()}`,
        this.toApiModel(input)
      )) as { data: ApiResponse<PositionApiModel> };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update position with id ${input.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/positions/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete position with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`/positions/${id}/restore`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to restore position with id ${id}`);
    }
  }

  private toApiModel(input: Position): PositionApiModel {
    return {
      id: parseInt(input.getId(), 10),
      name: input.getName(),
      created_at: input.getCreatedAt(),
      updated_at: input.getUpdatedAt()
    };
  }

  private toDomainModel(data: PositionApiModel): Position {
    return new Position(
      data.id.toString(),
      data.name,
      data.created_at.toString(),
      data.updated_at.toString()
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
