import type { ApiListResponse } from "../shared/repondata";
import type { ApiResponse } from "../shared/messageApi";
import type { Roleinterface,CreateRole,UpdateRole } from "../interfaces/role.interface";
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
        department_id: params.department_id,
        status: includeDeleted ? undefined : "active",
      },
    })) as { data: ApiListResponse<Roleinterface> };

    // console.log("API Response - findAll:", response.data);
    const pagination = response.data.pagination || {};

    const total = pagination.total || 0;
    const page = pagination.page || params.page || 1;
    const limit = pagination.limit || params.limit || 10;
    const totalPages = pagination.total_pages || Math.ceil(total / limit);

    return {
      data: response.data.data.map((item) => this.toDomainModel(item)),
      total,
      page,
      limit,
      totalPages,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
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

  async create(data: CreateRole): Promise<Role> {
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

  async update(id: string, data: UpdateRole): Promise<Role> {
    try {
      const payload = {
        department_id: data.department_id,
        name: data.name,
        permissions: data.permissions,
      };
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
      data.department_id,
      data.department_name || "",
      data.permissions,
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
