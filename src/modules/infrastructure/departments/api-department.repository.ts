import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { DepartmentRepository } from "@/modules/domain/repository/departments/department.repository";
import { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";
import type { ApiListResponse } from "@/modules/shared/repondata";

export class ApiDepartmentRepository implements DepartmentRepository {
  async create(department: DepartmentEntity): Promise<DepartmentEntity> {
    try {
      const response = (await api.post("/department", this.toApiModel(department))) as {
        data: ApiResponse<DepartmentApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create unit");
    }
  }

  async findById(id: string): Promise<DepartmentEntity | null> {
    try {
      const response = (await api.get(`/contact/${id}`)) as {
        data: ApiResponse<DepartmentApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find unit with id ${id}`);
    }
  }

  async findByName(name: string): Promise<DepartmentEntity | null> {
    try {
      const response = (await api.get("/contact", {
        params: { name },
      })) as { data: ApiListResponse<DepartmentApiModel> };

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
  ): Promise<PaginatedResult<DepartmentEntity>> {
    try {
      const response = (await api.get("/department", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      })) as { data: ApiListResponse<DepartmentApiModel> };

      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: Math.ceil(response.data.total / response.data.limit),
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch units list");
    }
  }

  async update(id: string, department: DepartmentEntity): Promise<DepartmentEntity> {
    try {
      const response = (await api.put(`/contact/${id}`, this.toApiModel(department))) as {
        data: ApiResponse<DepartmentApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update unit with id ${department.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/contact/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete unit with id ${id}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await api.post(`/contact/${id}/restore`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to restore unit with id ${id}`);
    }
  }

  private toApiModel(unit: DepartmentEntity): DepartmentApiModel {
    return {
      id: parseInt(unit.getId(), 10),
      name: unit.getName(),
      code: unit.getCode(),
      created_at: unit.getCreatedAt(),
      updated_at: unit.getUpdatedAt(),
    };
  }

  private toDomainModel(data: DepartmentApiModel): DepartmentEntity {
    return new DepartmentEntity(
      data.id.toString(),
      data.name,
      data.code || "",
      data.created_at || "",
      data.updated_at || ""
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
