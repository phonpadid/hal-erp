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
import type { PositionApiModel } from "@/modules/interfaces/position.interface";
import { Position } from "@/modules/domain/entities/position.entities";

export class ApiDepartmentUserRepository implements DepartmentUserRepository {
  async create(input: DepartmentUserEntity): Promise<DepartmentUserEntity> {
    try {
      // Convert to API model first
      const apiModel = this.toApiModel(input);
      const formData = new FormData();
      if (apiModel.user) {
        formData.append('username', apiModel.user.username || '');
        formData.append('email', apiModel.user.email || '');
        formData.append('password', apiModel.user.password ?? ''); // fallback to empty string if undefined
        formData.append('tel', apiModel.user.tel ?? ''); // fallback to empty string if undefined
      }
      formData.append('position_id', apiModel.position_id ?? '');
      if (apiModel.signature_file instanceof File) {
        formData.append('signature_file', apiModel.signature_file);
      } else if (typeof apiModel.signature_file === 'string') {
        formData.append('signature_file', apiModel.signature_file);
      }
      const response = await api.post("/department-users", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }) as {
        data: ApiResponse<DepartmentUserApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create");
    }
  }

  async findById(id: string): Promise<DepartmentUserEntity | null> {
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

  async findByName(name: string): Promise<DepartmentUserEntity | null> {
    try {
      const response = (await api.get("/department-user", {
        params: { name },
      })) as { data: ApiListResponse<DepartmentUserApiModel> };

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
  ): Promise<PaginatedResult<DepartmentUserEntity>> {
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

  async update(id: string, input: DepartmentUserEntity): Promise<DepartmentUserEntity> {
  try {
    const apiModel = this.toApiModel(input);
    const formData = new FormData();

    if (apiModel.user) {
      formData.append('username', apiModel.user.username || '');
      formData.append('email', apiModel.user.email || '');
      formData.append('password', apiModel.user.password ?? '');
      formData.append('tel', apiModel.user.tel ?? '');
    }

    formData.append('position_id', apiModel.position_id ?? '');

    if (apiModel.signature_file instanceof File) {
      formData.append('signature_file', apiModel.signature_file);
    } else if (typeof apiModel.signature_file === 'string') {
      formData.append('signature_file', apiModel.signature_file);
    }

    const response = await api.put(`/department-user/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as {
      data: ApiResponse<DepartmentUserApiModel>;
    };

    return this.toDomainModel(response.data.data);
  } catch (error) {
    return this.handleApiError(error, `Failed to update department user with id ${id}`);
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

  private toApiModel(dpmUser: DepartmentUserEntity): DepartmentUserApiModel {
    const user = dpmUser.getUser();
    return {
      user: user
        ? {
            id: Number(user.getId()), // use a getter if `id` is private
            username: user.getUsername(),
            email: user.getEmail(),
            password: user.getPassword(),
            tel: user.getTel()
          }
        : undefined,
      position_id: dpmUser.getPosition_id(),
      signature_file: dpmUser.getSignature_file(),
    };
  }


  private toDomainModel(data: DepartmentUserApiModel): DepartmentUserEntity {
    if (!data.user) {
      throw new Error('User is required to construct DepartmentUserEntity');
    }
    return new DepartmentUserEntity(
      data.id ?? '', // ID as string
      data.position_id ?? '',
      data.signature_file || '',    // string | File
      data.department ? this.toDepartmentEntity(data.department) : undefined,
      data.position ? this.toPositionEntity(data.position) : undefined,   // Position | undefined
      this.toUserEntity(data.user),       // UserEntity | undefined (should match constructor type)
      null,
      null,
      null
    );
  }

   private toUserEntity(user: UserInterface): UserEntity {
      return new UserEntity(
        user.id.toString(),
        user.username,
        user.email,
        user.created_at || "",
        user.updated_at || "",
        user.deleted_at || null,
        user.password,
        user.tel
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
    private toPositionEntity(position: PositionApiModel): Position {
      return new Position(
        position.id.toString(),
        position.name,
        position.created_at ?? '',
        position.updated_at ?? ''
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
