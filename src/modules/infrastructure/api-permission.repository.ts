import type { ApiListResponse } from "../shared/repondata";
import type { PermissionResponse } from "../interfaces/permission.interface";
import { Permission } from "../domain/entities/permission.entities";
import type { PermissionRepository } from "../domain/repository/permsision.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiPermissionRepository implements PermissionRepository {
  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Permission>> {
    try {
      const response = (await api.get("/permissions", {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search || "",
          status: includeDeleted ? undefined : "active",
        },
      })) as { data: ApiListResponse<PermissionResponse> };

      console.log("API Response - findAll:", response.data);

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

  private toDomainModel(data: PermissionResponse): Permission {
    return new Permission(
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
