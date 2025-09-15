import type { ApiListResponse } from "../shared/repondata";
import type { ApiResponse } from "../shared/messageApi";
import type { Roleinterface } from "../interfaces/role.interface";
import { Role } from "../domain/entities/role.entities";
import type { RoleRepository } from "../domain/repository/role.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiRoleRepository implements RoleRepository {
  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Role>> {
    try {
      const response = (await api.get("/roles", {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search || "",
          status: includeDeleted ? undefined : "active",
        },
      })) as { data: ApiListResponse<Roleinterface> };

      // console.log("API Response - findAll:", response.data);

      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: Math.ceil(response.data.total / response.data.limit),
      };
    } catch (error) {
      console.error("API Error - findAll:", error);
      this.handleApiError(error, "Failed to fetch roles list");
    }
  }

  async findById(id: string): Promise<Role | null> {
    try {
      // console.log("API Request - findById:", {
      //   url: `/role/${id}`,
      // });

      const response = (await api.get(`/roles/${id}`)) as { data: ApiResponse<Roleinterface> };

      // console.log("API Response - findById:", response.data);

      return this.toDomainModel(response.data.data);
    } catch (error) {
      console.error("API Error - findById:", error);

      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find role with id ${id}`);
    }
  }

  async findByName(name: string): Promise<Role | null> {
    try {
      // console.log("API Request - findByName:", {
      //   url: "/role",
      //   params: { name },
      // });

      const response = (await api.get("/roles", {
        params: { name, limit: 1 },
      })) as { data: ApiListResponse<Roleinterface> };

      // console.log("API Response - findByName:", response.data);

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error("API Error - findByName:", error);
      return null;
    }
  }

  async create(data: { name: string; display_name: string }): Promise<Role> {
    try {
      const response = (await api.post("/roles", data)) as {
        data: ApiResponse<Roleinterface>;
      };

      // console.log("API Response - create:", response.data);

      return this.toDomainModel(response.data.data);
    } catch (error) {
      console.error("API Error - create:", error);
      this.handleApiError(error, "Failed to create role");
    }
  }

  async update(id: string, role: Role): Promise<Role> {
    try {
      const payload = {
        name: role.getName(),
        display_name: role.getDisplayname(),
      };

      // console.log("API Request - update:", {
      //   url: `/role/${id}`,
      //   data: payload,
      // });

      const response = (await api.put(`/roles/${id}`, payload)) as {
        data: ApiResponse<Roleinterface>;
      };

      // console.log("API Response - update:", response.data);

      return this.toDomainModel(response.data.data);
    } catch (error) {
      console.error("API Error - update:", error);
      this.handleApiError(error, `Failed to update role with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/roles/${id}`);
      return true;
    } catch (error) {
      console.error("API Error - delete:", error);
      this.handleApiError(error, `Failed to delete role with id ${id}`);
    }
  }

  private toDomainModel(data: Roleinterface): Role {
    return new Role(
      data.id.toString(),
      data.name,
      data.display_name,
      data.created_at,
      data.updated_at
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
