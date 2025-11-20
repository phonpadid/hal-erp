import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";
import { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { DepartmentRoleApiModel, DepartmentRoleWithDetailsApiModel } from "@/modules/interfaces/departments/department-role.interface";
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { DepartmentRoleWithDetailsDTO } from "@/modules/application/dtos/departments/department-role.dto";

export class ApiDepartmentRoleRepository implements DepartmentRoleRepository {
  async create(departmentRole: DepartmentRole): Promise<DepartmentRole> {
    try {
      const response = (await api.post("/roles/department", this.toApiModel(departmentRole))) as {
        data: ApiResponse<DepartmentRoleApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create department role");
    }
  }

  async findById(id: string): Promise<DepartmentRole | null> {
    try {
      const response = (await api.get(`/roles/${id}`)) as {
        data: ApiResponse<DepartmentRoleApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find department role with id ${id}`);
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentRole>> {
    try {
      const response = (await api.get("/role", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.department_id && { department_id: params.department_id }),
        },
      })) as { data: ApiListResponse<DepartmentRoleApiModel> };
      const { pagination } = response.data;
      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch department roles list");
    }
  }

  async findAllWithDetails(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentRoleWithDetailsDTO>> {
    try {
      const response = (await api.get("/roles", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.department_id && { department_id: params.department_id }),
        },
      })) as { data: ApiListResponse<DepartmentRoleWithDetailsApiModel> };
      const { pagination } = response.data;
      return {
        data: response.data.data.map((item) => this.toDomainModelWithDetails(item)),
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch department roles with details");
    }
  }

  async findByDepartmentId(departmentId: number): Promise<DepartmentRole[]> {
    try {
      const response = (await api.get(`/department-role/department/${departmentId}`)) as {
        data: ApiResponse<DepartmentRoleApiModel[]>;
      };
      return response.data.data.map((item) => this.toDomainModel(item));
    } catch (error) {
      return this.handleApiError(error, `Failed to find department roles for department ${departmentId}`);
    }
  }

  async findByRoleId(roleId: number): Promise<DepartmentRole[]> {
    try {
      const response = (await api.get(`/department-role/role/${roleId}`)) as {
        data: ApiResponse<DepartmentRoleApiModel[]>;
      };
      return response.data.data.map((item) => this.toDomainModel(item));
    } catch (error) {
      return this.handleApiError(error, `Failed to find department roles for role ${roleId}`);
    }
  }

  async update(id: string, departmentRole: DepartmentRole): Promise<DepartmentRole> {
    try {
      const response = (await api.put(`/roles/department/${id}`, this.toApiModel(departmentRole))) as {
        data: ApiResponse<DepartmentRoleApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update department role with id ${departmentRole.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/roles/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete department role with id ${id}`);
    }
  }

  async restore(id: string): Promise<DepartmentRole> {
    try {
      const response = (await api.post(`/department-role/${id}/restore`)) as {
        data: ApiResponse<DepartmentRoleApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to restore department role with id ${id}`);
    }
  }

  private toApiModel(input: DepartmentRole): DepartmentRoleApiModel {
    return {
      id: parseInt(input.getId(), 10),
      role_id: input.getRoleId(),
      department_id: input.getDepartmentId(),
      permissions: input.getPermissions(),
      created_at: input.getCreatedAt().toISOString(),
      updated_at: input.getUpdatedAt().toISOString(),
    };
  }

  private toDomainModel(data: DepartmentRoleApiModel): DepartmentRole {
    return new DepartmentRole(
      data.id.toString(),
      data.role_id,
      data.department_id,
      data.permissions,
      data.created_at || new Date().toISOString(),
      data.updated_at || new Date().toISOString(),
      data.deleted_at || null
    );
  }

  private toDomainModelWithDetails(data: DepartmentRoleWithDetailsApiModel): DepartmentRoleWithDetailsDTO {
    return {
      id: data.id.toString(),
      role_id: data.role_id,
      department_id: data.department_id,
      permissions: data.permissions,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      deletedAt: data.deleted_at || null,
      name: data.name,
      role_display_name: data.role_display_name,
      department_name: data.department_name,
      department_code: data.department_code,
    };
  }

  private handleApiError<T>(error: unknown, defaultMessage: string): T {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      throw new Error(`${serverMessage}`);
    } else if (axiosError.request) {
      throw new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      throw new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
