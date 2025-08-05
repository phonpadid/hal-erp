import { DocumentStatusEntity } from "@/modules/domain/entities/document-status.entity";
import type { DocumentStatusRepository } from "@/modules/domain/repository/document-status.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiDocumentStatusRepository implements DocumentStatusRepository {
  private readonly baseUrl = "/document-status";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DocumentStatusEntity>> {
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
        data: response.data.data.map((documentStatus: unknown) =>
          this.toDomainModel(documentStatus)
        ),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch document types list");
    }
  }
  private toDomainModel(data: unknown): DocumentStatusEntity {
    if (typeof data !== "object" || data === null) {
      throw new Error("Invalid data format for DocumentStatusEntity");
    }

    const { id, name, createdAt, updatedAt, deletedAt } = data as {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      deletedAt?: string | null;
    };

    return new DocumentStatusEntity(id, name, createdAt, updatedAt, deletedAt || null);
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
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
