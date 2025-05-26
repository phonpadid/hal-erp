import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";
import { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import type { DepartmentUserApiModel } from "@/modules/interfaces/departments/department-user.interface";
import type { DepartmentApproverRepository } from "@/modules/domain/repository/departments/department-approver.repository";
import { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";

export class ApiDepartmentApproverRepository implements DepartmentApproverRepository {
  async create(input: DepartmentApproverEntity): Promise<DepartmentApproverEntity> {
    try {
      // Convert to API model first
      const response = (await api.post("/department", this.toApiModel(input))) as {
        data: ApiResponse<DepartmentUserApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create");
    }
  }

  async findOne(id: string): Promise<DepartmentApproverEntity | null> {
    try {
      const response = (await api.get(`/department-user/${id}`)) as {
        data: ApiResponse<DepartmentUserApiModel>;
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
  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentApproverEntity>> {
    try {
      const response = (await api.get("/department-user", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      })) as { data: ApiListResponse<DepartmentUserApiModel> };

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

  async update(id: string, department: DepartmentApproverEntity): Promise<DepartmentApproverEntity> {
    try {
      const response = (await api.put(`/department-user/${id}`, this.toApiModel(department))) as {
        data: ApiResponse<DepartmentUserApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update unit with id ${department.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/department-user/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete unit with id ${id}`);
    }
  }

  private toApiModel(dpmUser: DepartmentApproverEntity): DepartmentUserApiModel {
    return {
      id: parseInt(dpmUser.getId(), 10),
      user_id: dpmUser.getUser_id(),
      department_id: dpmUser.getDeparture_id(),
      created_at: dpmUser.getCreatedAt().toString(),
      updated_at: dpmUser.getUpdatedAt().toDateString(),
    };
  }

  private toDomainModel(data: DepartmentUserApiModel): DepartmentApproverEntity {
    return new DepartmentApproverEntity(
      data.id.toString(),
      data.department_id || "",
      data.user_id,
      new Date(data.created_at || new Date()),
      new Date(data.updated_at || new Date()),
      null // or: data.deleted_at ? new Date(data.deleted_at) : null
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
