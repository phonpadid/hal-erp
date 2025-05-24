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
      return this.handleApiError(error, "Failed to create");
    }
  }

  async findById(id: string): Promise<DepartmentEntity | null> {
    try {
      const response = (await api.get(`/department/${id}`)) as {
        data: ApiResponse<DepartmentApiModel>;
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
  ): Promise<PaginatedResult<DepartmentEntity>> {
    try {
      const response = await api.get("/department", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      }) as { data: ApiListResponse<DepartmentApiModel> };
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


  async update(id: string, department: DepartmentEntity): Promise<DepartmentEntity> {
    try {
      const response = (await api.put(`/department/${id}`, this.toApiModel(department))) as {
        data: ApiResponse<DepartmentApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update with id ${department.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/department/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete with id ${id}`);
    }
  }


  private toApiModel(input: DepartmentEntity): DepartmentApiModel {
    return {
      id: parseInt(input.getId(), 10),
      name: input.getName(),
      code: input.getCode(),
      created_at: input.getCreatedAt(),
      updated_at: input.getUpdatedAt(),
    };
  }

  private toDomainModel(data: DepartmentApiModel): DepartmentEntity {
    return new DepartmentEntity(
      data.id.toString(),
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
