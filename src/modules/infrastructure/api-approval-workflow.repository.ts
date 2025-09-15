import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { ApiListResponse } from "@/modules/shared/repondata";
import type { ApprovalWorkflowRepository } from "../domain/repository/approval-workflow.repository";
import { ApprovalWorkflowEntity } from "../domain/entities/approval-workflows.entity";
import type { ApprovalWorkflowApiModel } from "../interfaces/approval-workflow.interface";
import type { DoucmentTypeInterface } from "../interfaces/documenet-type.interface";
import { DocumentTypeEntity } from "../domain/entities/document-type.entities";

export class ApiApprovalWorkflowRepository implements ApprovalWorkflowRepository {
  async create(input: ApprovalWorkflowEntity): Promise<ApprovalWorkflowEntity> {
    try {
      const response = (await api.post("/approval-workflows", this.toApiModel(input))) as {
        data: ApiResponse<ApprovalWorkflowApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create");
    }
  }

  async findById(id: string): Promise<ApprovalWorkflowEntity | null> {
    try {
      const response = (await api.get(`/approval-workflows/${id}`)) as {
        data: ApiResponse<ApprovalWorkflowApiModel>;
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
  ): Promise<PaginatedResult<ApprovalWorkflowEntity>> {
    try {
      const response = await api.get("/approval-workflows", {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      }) as { data: ApiListResponse<ApprovalWorkflowApiModel> };
      // console.log('ddddddddd:', response.data);

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


  async update(id: string, input: ApprovalWorkflowEntity): Promise<ApprovalWorkflowEntity> {
    try {
      const response = (await api.put(`/approval-workflows/${id}`, this.toApiModel(input))) as {
        data: ApiResponse<ApprovalWorkflowApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update with id ${input.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/approval-workflows/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete with id ${id}`);
    }
  }


  private toApiModel(input: ApprovalWorkflowEntity): ApprovalWorkflowApiModel {
    return {
      id: Number(input.getId()),
      name: input.getName(),
      documentTypeId: Number(input.getDocumentTypeId()),
      steps: input.getSteps().map((item) => ({
        id: item.id ?? '',
        approval_workflow_id: item.approval_workflow_id, // Changed from approvalWorkflowId
        departmentId: item.departmentId,
        userId: item.userId,
        step_name: item.step_name,
        step_number: item.step_number,
        type: item.type,
        requires_file: item.requires_file,
        is_otp: item.is_otp,
      })),
    };
  }

  private toDomainModel(data: ApprovalWorkflowApiModel): ApprovalWorkflowEntity {

    const res = new ApprovalWorkflowEntity(
      data.id.toString(),
      data.name,
      String(data.documentTypeId),
      data.document_type ? this.toDocumentTypeEntity(data.document_type) : undefined,
      [],
      data.created_at || "",
      data.updated_at || "",
    );

    return res
  }

  //docType
  private toDocumentTypeEntity(model: DoucmentTypeInterface): DocumentTypeEntity {
    return new DocumentTypeEntity(
      model.id.toString(),
      model.name,
      model.code ?? '',
      model.created_at ?? '',
      model.updated_at ?? ''
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
