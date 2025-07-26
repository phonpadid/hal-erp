import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";
import { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import type { DepartmentUserApiModel } from "@/modules/interfaces/departments/department-user.interface";
import type { UserInterface } from "@/modules/interfaces/user.interface";
import { UserEntity } from "@/modules/domain/entities/user.entities";
import { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { DepartmentApiModel } from "@/modules/interfaces/departments/department.interface";
import type { PositionInterface } from "@/modules/interfaces/position.interface";
import { PositionEntity } from "@/modules/domain/entities/position.entity";
import { Role } from "@/modules/domain/entities/role.entities";
import type { Roleinterface } from "@/modules/interfaces/role.interface";
import type { PermissionResponse } from "@/modules/interfaces/permission.interface";
import { Permission } from "@/modules/domain/entities/permission.entities";

export class ApiDepartmentUserRepository implements DepartmentUserRepository {
  async create(input: DepartmentUserEntity): Promise<DepartmentUserEntity> {
    try {
      const apiModel = this.toApiModel(input);
      const formData = new FormData();

      // Append user fields with null checks
      if (apiModel.user) {
        formData.append('username', apiModel.user.username || '');
        formData.append('email', apiModel.user.email || '');
        if (apiModel.user.password) {
          formData.append('password', apiModel.user.password);
        }
        if (apiModel.user.tel) {
          formData.append('tel', apiModel.user.tel);
        }
      }

      // Append position with proper validation
      if (apiModel.position_id) {
        formData.append('positionId', apiModel.position_id);
      }

      // Handle signature file properly
      if (apiModel.signature_file instanceof File) {
        formData.append('signatureFile', apiModel.signature_file);
      } else if (typeof apiModel.signature_file === 'string' && apiModel.signature_file.trim()) {
        formData.append('signatureFile', apiModel.signature_file);
      }

      // Append departmentId with proper validation
      if (apiModel.department_id) {
        formData.append('departmentId', String(apiModel.department_id));
      }

      // Handle arrays properly
      const permissionIds = Array.isArray(apiModel.permissionIds) ? apiModel.permissionIds : [];
      const roleIds = Array.isArray(apiModel.roleIds) ? apiModel.roleIds : [];

      formData.append('permissionIds', JSON.stringify(permissionIds));
      formData.append('roleIds', JSON.stringify(roleIds));

      const response = await api.post("/department-users", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }) as {
        data: ApiResponse<DepartmentUserApiModel>;
      };

      return this.toDomainModel(response.data.data);
    } catch (error) {
      throw this.handleApiError(error, "Failed to create department user");
    }
  }

  async findById(id: string): Promise<DepartmentUserEntity | null> {
    try {
      const response = await api.get(`/department-users/${id}`) as {
        data: ApiResponse<DepartmentUserApiModel>;
      };

      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw this.handleApiError(error, `Failed to find department user with id ${id}`);
    }
  }

  async findByName(name: string): Promise<DepartmentUserEntity | null> {
    try {
      const response = await api.get("/department-users", {
        params: { name },
      }) as { data: ApiListResponse<DepartmentUserApiModel> };

      if (!response.data.data || response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error(`Error finding department user by name '${name}':`, error);
      return null;
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentUserEntity>> {
    try {
      const response = await api.get("/department-users", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
          ...(params.type && { type: params.type }),
        },
      }) as { data: ApiListResponse<DepartmentUserApiModel> };

      const validItems = response.data.data.filter((item) => item.user);
      const domainModels = validItems.map((item) => this.toDomainModel(item));
      return {
        data: domainModels,
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      throw this.handleApiError(error, "Failed to fetch department users list");
    }
  }

  async update(id: string, input: DepartmentUserEntity): Promise<DepartmentUserEntity> {
    const userId = input.getUser()?.getId()
    try {
      const apiModel = this.toApiModel(input);
      const formData = new FormData();

      // Append user fields with null checks
      if (apiModel.user) {
        formData.append('username', apiModel.user.username || '');
        formData.append('email', apiModel.user.email || '');
        if (apiModel.user.password) {
          formData.append('password', apiModel.user.password);
        }
        if (apiModel.user.tel) {
          formData.append('tel', apiModel.user.tel);
        }
      }

      // Append position with proper validation
      if (apiModel.position_id) {
        formData.append('positionId', apiModel.position_id);
      }

      // Handle signature file properly
      if (apiModel.signature_file instanceof File) {
        formData.append('signatureFile', apiModel.signature_file);
      } else if (typeof apiModel.signature_file === 'string' && apiModel.signature_file.trim()) {
        formData.append('signatureFile', apiModel.signature_file);
      }else {
        formData.append('signatureFile', '');
      }

      // Append departmentId with proper validation
      if (apiModel.department_id) {
        formData.append('departmentId', String(apiModel.department_id));
      }

      // Handle arrays properly
      const permissionIds = Array.isArray(apiModel.permissionIds) ? apiModel.permissionIds : [];
      const roleIds = Array.isArray(apiModel.roleIds) ? apiModel.roleIds : [];

      formData.append('permissionIds', JSON.stringify(permissionIds));
      formData.append('roleIds', JSON.stringify(roleIds));

      // Use the provided id parameter instead of extracting from input
      const response = await api.put(`/department-users/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }) as {
        data: ApiResponse<DepartmentUserApiModel>;
      };

      return this.toDomainModel(response.data.data);
    } catch (error) {
      throw this.handleApiError(error, `Failed to update department user with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/department-users/${id}`);
      return true;
    } catch (error) {
      throw this.handleApiError(error, `Failed to delete department user with id ${id}`);
    }
  }

  private toApiModel(dpmUser: DepartmentUserEntity): DepartmentUserApiModel {
    const user = dpmUser.getUser();
    return {
      user: user
        ? {
          id: Number(user.getId()),
          username: user.getUsername(),
          email: user.getEmail(),
          password: user.getPassword(),
          tel: user.getTel(),
          roleIds: user.getRoleIds(),
          roles: user.getRoles(),
          permissionIds: user.getPermissionIds()
        } as UserInterface
        : undefined,
      position_id: dpmUser.getPosition_id(),
      signature_file: dpmUser.getSignature_file(),
      department_id: Number(dpmUser.getDepartmentId()),
      permissionIds: dpmUser.getPermissionIds(),
      roleIds: dpmUser.getRoleIds()
    };
  }

  private toDomainModel(data: DepartmentUserApiModel): DepartmentUserEntity {
    const id = data.id ?? '';
    const position_id = data.position_id ?? '';
    const signature_file = data.signature_file_url || '';
    const departmentId = data.department_id ? String(data.department_id) : '';
    const permissionIds = data.user?.roles.map(role => role.id) ?? [];
    const roleIds = data.user?.permissions?.map(per => per.id) ?? [];

    const department = data.department ? this.toDepartmentEntity(data.department) : undefined;
    const position = data.position ? this.toPositionEntity(data.position) : undefined;

    // Handle user data - create a user entity or use placeholder
    const user = data.user ? this.toUserEntity(data.user) : this.createPlaceholderUser();

    const roles = data.roles ? this.toRoleEntity(data.roles) : undefined;
    const permissions = data.permissions ? this.toPermissionEntity(data.permissions) : undefined;

    const createdAt = data.created_at ? new Date(data.created_at) : null;
    const updatedAt = data.updated_at ? new Date(data.updated_at) : null;

    return new DepartmentUserEntity(
      id,
      position_id,
      signature_file,
      '', // Empty string for the 4th parameter - you may need to adjust this
      departmentId,
      roleIds,
      permissionIds,
      department,
      position,
      user, // This is now always UserEntity (never undefined)
      roles,
      permissions,
      createdAt,
      updatedAt,
      null
    );
  }

  private toUserEntity(user: UserInterface): UserEntity {
    const roleIds = user.roles?.map(role => role.id) || [];
    const permissionIds = user.permissions?.map(perm => perm.id) || [];
    const roles = user.roles || []
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
      '',           // id
      '',           // username
      '',
      [],          // email
      [],          // email
      [],          // email
      '',           // created_at
      '',           // updated_at
      null,         // deleted_at
      undefined,    // password
      undefined     // tel
    );
  }

  private toDepartmentEntity(departmentData: DepartmentApiModel): DepartmentEntity {
    return new DepartmentEntity(
      departmentData.id.toString(),
      departmentData.name,
      departmentData.code ?? '',
      departmentData.created_at ?? '',
      departmentData.updated_at ?? ''
    );
  }

  private toPositionEntity(position: PositionInterface): PositionEntity {
    return new PositionEntity(
      position.id.toString(),
      position.name,
      position.created_at ?? '',
      position.updated_at ?? ''
    );
  }

  private toRoleEntity(role: Roleinterface): Role {
    return new Role(
      role.id.toString(),
      role.name,
      role.display_name,
      role.created_at ?? '',
      role.updated_at ?? ''
    );
  }

  private toPermissionEntity(per: PermissionResponse): Permission {
    return new Permission(
      per.id,
      per.name,
      per.display_name,
      "",
      [],
      per.created_at ?? '',
      per.updated_at ?? ''
    );
  }

  private handleApiError(error: unknown, defaultMessage: string): Error {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response) {
      const statusCode = axiosError.response.status;
      const serverMessage = axiosError.response.data?.message || defaultMessage;
      return new Error(`API Error (${statusCode}): ${serverMessage}`);
    } else if (axiosError.request) {
      return new Error(
        `Network Error: The request was made but no response was received. Please check your connection.`
      );
    } else {
      return new Error(`${defaultMessage}: ${(error as Error).message || "Unknown error"}`);
    }
  }
}
