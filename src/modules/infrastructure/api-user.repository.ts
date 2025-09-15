/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  UserCreatePayload,
  UserUpdatePayload,
  UserChangePasswordPayload,
} from "./../interfaces/user.interface";
import { UserEntity } from "@/modules/domain/entities/user.entities";
import type { UserRepository } from "@/modules/domain/repository/user.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiUserRepository implements UserRepository {
  private readonly baseUrl = "/users";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<UserEntity>> {
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
        data: response.data.data.map((user: unknown) => this.toDomainModel(user)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.totalPages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch users list");
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      // console.log("API Response:", response.data);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find user with id ${id}`);
    }
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { username, limit: 1 },
      });

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error(`Error finding user by username '${username}':`, error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { email, limit: 1 },
      });

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error(`Error finding user by email '${email}':`, error);
      return null;
    }
  }

  async create(userData: UserCreatePayload): Promise<UserEntity> {
    try {
      const response = await api.post(this.baseUrl, userData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create user");
    }
  }

  async update(id: string, userData: UserUpdatePayload): Promise<UserEntity> {
    try {
      const apiData = {
        ...userData,
        roles: userData.roleIds,
        permissions: userData.permissionIds,
      };

      const response = await api.put(`${this.baseUrl}/${id}`, apiData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, `Failed to update user with id ${id}`);
    }
  }

  async changePassword(
    id: string,
    changePasswordDTO: UserChangePasswordPayload
  ): Promise<UserEntity | null> {
    try {
      const response = await api.put(`${this.baseUrl}/change-password/${id}`, {
        old_password: changePasswordDTO.old_password,
        new_password: changePasswordDTO.new_password,
      });

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response format from server");
      }

      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;

      if (axiosError.response) {
        switch (axiosError.response.status) {
          case 400:
            throw new Error("Invalid password format");
          case 401:
            throw new Error("Current password is incorrect");
          case 403:
            throw new Error("Not authorized to change password");
          case 404:
            throw new Error(`User with id ${id} not found`);
          default:
            throw new Error(
              axiosError.response.data?.message ||
                `Failed to change password for user with id ${id}`
            );
        }
      }

      this.handleApiError(error, `Failed to change password for user with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete user with id ${id}`);
    }
  }

  private toDomainModel(apiResponse: any): UserEntity {
    const data = apiResponse.data || apiResponse;
    const roleIds = data.roles?.map((role: any) => role.id) || [];
    const roles = data.roles || [];
    const permissionIds = data.permissions?.map((perm: any) => perm.id) || [];
    return new UserEntity(
      data.id.toString(),
      data.username,
      data.email,
      roleIds,
      roles,
      permissionIds,
      data.created_at || "",
      data.updated_at || "",
      data.deleted_at || null,
      data.password,
      data.tel
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
