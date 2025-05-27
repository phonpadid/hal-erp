import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { UserApprovalRepository } from "@/modules/domain/repository/user-approvals/user-approval.repository";
import { UserApprovalEntity } from "@/modules/domain/entities/user-approvals/user-approval.entity";
import type { UserApprovalApiModel } from "@/modules/interfaces/user-approvals/user-approval.interface";

export class ApiUserApprovaltRepository implements UserApprovalRepository {
  async create(input: UserApprovalEntity): Promise<UserApprovalEntity> {
    try {
      const response = (await api.post("/user-approval", this.toApiModel(input))) as {
        data: ApiResponse<UserApprovalApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create");
    }
  }

  async findById(id: string): Promise<UserApprovalEntity | null> {
    try {
      const response = (await api.get(`/user-approval/${id}`)) as {
        data: ApiResponse<UserApprovalApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null;
      }
      return this.handleApiError(error, `Failed to find with id ${id}`);
    }
  }

  async findAll(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<UserApprovalEntity>> {
    try {
      const response = await api.get("/user-approval", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      }) as { data: ApiListResponse<UserApprovalApiModel> };
      const { pagination } = response.data;
      return {
        data: response.data.data.map((item) => this.toDomainModel(item)),
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.total_pages,
      };
    } catch (error) {
      return this.handleApiError(error, "Failed to fetch list");
    }
  }


  async update(id: string, department: UserApprovalEntity): Promise<UserApprovalEntity> {
    try {
      const response = (await api.put(`/department/${id}`, this.toApiModel(department))) as {
        data: ApiResponse<UserApprovalApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update with id ${department.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/department/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete with id ${id}`);
    }
  }


  private toApiModel(input: UserApprovalEntity): UserApprovalApiModel {
    return {
      id: parseInt(input.getId(), 10),
      status_id: input.getStatusId(),
      approval_workflow_id: input.getApprovalId(),
      document_id: input.getDocumentId(),

      doc_title: input.getDocumentName() ?? "",
      approval_workflow_name: input.getApprovalName() ?? "",
      status_name: input.getStatusName() ?? "",
      created_at: input.getCreatedAt() ?? '',
      updated_at: input.getUpdatedAt() ?? '',
    };
  }

  private toDomainModel(data: UserApprovalApiModel): UserApprovalEntity {
    return new UserApprovalEntity(
      data.id.toString(),
      data.approval_workflow_id || "",
      data.status_id || "",
      data.document_id || "",

      data.approval_workflow_name || "",
      data.status_name || "",
      data.doc_title || "",
      data.created_at || "",
      data.updated_at || "",
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
