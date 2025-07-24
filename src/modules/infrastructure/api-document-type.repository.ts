import type {
  DocumentTypeCreate,
  DocumentTypeUpdate,
} from "./../interfaces/documenet-type.interface";
import { DocumentTypeEntity } from "@/modules/domain/entities/document-type.entities";
import type { DocumentTypeRepository } from "@/modules/domain/repository/document-type.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";

export class ApiDocumentTypeRepository implements DocumentTypeRepository {
  private readonly baseUrl = "/document-types";

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DocumentTypeEntity>> {
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
        data: response.data.data.map((documentType: unknown) => this.toDomainModel(documentType)),
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.total_pages,
      };
    } catch (error) {
      this.handleApiError(error, "Failed to fetch document types list");
    }
  }

  async findById(id: string): Promise<DocumentTypeEntity | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      this.handleApiError(error, `Failed to find document type with id ${id}`);
    }
  }

  async findByCode(code: string): Promise<DocumentTypeEntity | null> {
    try {
      const response = await api.get(this.baseUrl, {
        params: { code, limit: 1 },
      });

      if (response.data.data.length === 0) {
        return null;
      }

      return this.toDomainModel(response.data.data[0]);
    } catch (error) {
      console.error(`Error finding document type by code '${code}':`, error);
      return null;
    }
  }

  async create(documentTypeData: DocumentTypeCreate): Promise<DocumentTypeEntity> {
    try {
      const response = await api.post(this.baseUrl, documentTypeData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      this.handleApiError(error, "Failed to create document type");
    }
  }

  async update(id: string, documentTypeData: DocumentTypeUpdate): Promise<DocumentTypeEntity> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, documentTypeData);
      return this.toDomainModel(response.data.data);
    } catch (error) {
      // const axiosError = error as AxiosError;
      // console.log(
      //   `Error updating document type with id '${id}':`,
      //   axiosError.response?.data &&
      //     typeof axiosError.response.data === "object" &&
      //     "message" in axiosError.response.data
      //     ? (axiosError.response.data as { message?: string }).message
      //     : undefined
      // );
      this.handleApiError(error, `Failed to update document type with id ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      this.handleApiError(error, `Failed to delete document type with id ${id}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomainModel(documentType: any): DocumentTypeEntity {
    return new DocumentTypeEntity(
      documentType.id.toString(),
      documentType.name,
      documentType.code || "",
      documentType.created_at || "",
      documentType.updated_at || "",
      documentType.deleted_at || null
    );
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
