import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { DepartmentApproverRepository } from "@/modules/domain/repository/departments/department-approver.repository";
import { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type { DepartmentApproverApiModel } from "@/modules/interfaces/departments/department-approver.interface";
import { UserEntity } from "@/modules/domain/entities/user.entities";
import type { UserInterface } from "@/modules/interfaces/user.interface";
import { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";

export class ApiDepartmentApproverRepository implements DepartmentApproverRepository {
  async create(input: DepartmentApproverEntity): Promise<DepartmentApproverEntity> {
    try {
      // Convert to API model first
      const response = (await api.post("/department-approvers", this.toApiModel(input))) as {
        data: ApiResponse<DepartmentApproverApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create");
    }
  }
  async createByAdmin(input: DepartmentApproverEntity): Promise<DepartmentApproverEntity> {
    try {
      // Convert to API model first
      const response = (await api.post("/department-approvers/by/user", this.toApiModel(input))) as {
        data: ApiResponse<DepartmentApproverApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create");
    }
  }

  async findOne(id: string): Promise<DepartmentApproverEntity | null> {
    try {
      const response = (await api.get(`/department-approvers/${id}`)) as {
        data: ApiResponse<DepartmentApproverApiModel>;
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
      const response = (await api.get("/department-approvers", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      })) as { data: ApiListResponse<DepartmentApproverApiModel> };

      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch units list");
    }
  }

  async update(
    id: string,
    department: DepartmentApproverEntity
  ): Promise<DepartmentApproverEntity> {
    try {
      const response = (await api.put(
        `/department-approvers/${id}`,
        this.toApiModel(department)
      )) as {
        data: ApiResponse<DepartmentApproverApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update unit with id ${department.getId()}`);
    }
  }
  async updateByAdmin(
    id: string,
    department: DepartmentApproverEntity
  ): Promise<DepartmentApproverEntity> {
    try {
      const response = (await api.put(
        `/department-approvers/by/user/${id}`,
        this.toApiModel(department)
      )) as {
        data: ApiResponse<DepartmentApproverApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update unit with id ${department.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/department-approvers/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete unit with id ${id}`);
    }
  }

  private toApiModel(dpmApv: DepartmentApproverEntity): DepartmentApproverApiModel {
    const res = {
      id: Number(dpmApv.getId()),
      user_id: Number(dpmApv.getUser_id()),
      department_id: Number(dpmApv.getDepartmentId()) ?? "",
      created_at: dpmApv.getCreatedAt() ?? "",
      updated_at: dpmApv.getUpdatedAt() ?? "",
    };
    return res;
  }

  private toDomainModel(data: DepartmentApproverApiModel): DepartmentApproverEntity {
    const department = data.department ? this.toDepartmentEntity(data.department) : undefined;
    const user = data.user ? this.toUserEntity(data.user) : this.createPlaceholderUser();
    return new DepartmentApproverEntity(
      data.id.toString(),
      data.user_id.toString(),
      data.department_id.toString() ?? "",
      user,
      department,
      data.created_at,
      data.updated_at,
      null // or: data.deleted_at ? new Date(data.deleted_at) : null
    );
  }

  //
  private toUserEntity(user: UserInterface): UserEntity {
    const roleIds = user.roles?.map((role) => role.id) || [];
    const permissionIds = user.permissions?.map((perm) => perm.id) || [];
    const roles = user.roles || [];
    return new UserEntity(
      user.id.toString(),
      user.username,
      user.email,
      roleIds,
      roles,
      permissionIds,
      user.created_at || "",
      user.updated_at || "",
      user.deleted_at || null,
      user.password,
      user.tel
    );
  }

  private createPlaceholderUser(): UserEntity {
    // Create a placeholder user entity when user data is not available
    return new UserEntity(
      "", // id
      "", // username
      "",
      [], // email
      [], // email
      [], // email
      "", // created_at
      "", // updated_at
      null, // deleted_at
      undefined, // password
      undefined // tel
    );
  }

  private toDepartmentEntity(departmentData: DepartmentApiModel): DepartmentEntity {
    return new DepartmentEntity(
      departmentData.id.toString(),
      departmentData.name,
      departmentData.code ?? "",
      departmentData.created_at ?? "",
      departmentData.updated_at ?? ""
    );
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
