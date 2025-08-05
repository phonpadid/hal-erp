import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import { api } from "@/common/config/axios/axios";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/modules/shared/messageApi";
import type { ApiListResponse } from "@/modules/shared/repondata";
import { ApprovalWorkflowStepEntity } from "../domain/entities/approval-workflows-step.entity";
import type { ApprovalWorkflowStepApiModel, IApprovalWorkflowStepApiModel } from "../interfaces/approval-workflow-step.interface";
import type { ApprovalWorkflowStepRepository } from "../domain/repository/approval-workflow-step.repository";
import { ApprovalWorkflowEntity } from "../domain/entities/approval-workflows.entity";
import type { ApprovalWorkflowApiModel } from "../interfaces/approval-workflow.interface";
import type { DepartmentApiModel } from "../interfaces/departments/department.interface";
import { DepartmentEntity } from "../domain/entities/departments/department.entity";
import type { UserInterface } from "../interfaces/user.interface";
import { UserEntity } from "../domain/entities/user.entities";

export class ApiApprovalWorkflowStepRepository implements ApprovalWorkflowStepRepository {
  async create(id: number, input: ApprovalWorkflowStepEntity): Promise<ApprovalWorkflowStepEntity> {
    try {
      const response = (await api.post("/approval-workflow-steps/"+id, this.toApiModel(input))) as {
        data: ApiResponse<IApprovalWorkflowStepApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, "Failed to create");
    }
  }

  async findById(id: string): Promise<ApprovalWorkflowStepEntity | null> {
    try {
      const response = (await api.get(`/approval-workflow-steps/work-flow-step-id/${id}`)) as {
        data: ApiResponse<IApprovalWorkflowStepApiModel>;
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
    id: string,
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ApprovalWorkflowStepEntity>> {
    try {
      const response = await api.get("/approval-workflow-steps/approval-workflow-id/"+id, {
        params: {
          page: params.page,
          limit: params.limit,
          includeDeleted,
          ...(params.search && { search: params.search }),
        },
      }) as { data: ApiListResponse<IApprovalWorkflowStepApiModel> };
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


  async update(id: string, input: ApprovalWorkflowStepEntity): Promise<ApprovalWorkflowStepEntity> {
    try {
      const response = (await api.put(`/approval-workflow-steps/${id}`, this.toApiModel(input))) as {
        data: ApiResponse<IApprovalWorkflowStepApiModel>;
      };
      return this.toDomainModel(response.data.data);
    } catch (error) {
      return this.handleApiError(error, `Failed to update with id ${input.getId()}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/approval-workflow-steps/${id}`);
      return true;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete with id ${id}`);
    }
  }


  private toApiModel(input: ApprovalWorkflowStepEntity): ApprovalWorkflowStepApiModel {
    return {
      id: input.getId() ?? '',
      approval_workflow_id: Number(input.getApprovalWorkflowId()),
      departmentId: Number(input.getDepartemntId()) ?? 0,
      step_name: input.getStepName(),
      step_number: input.getStepNumber(),
      userId: input.getUserId(),
      type: input.getType(),
      requires_file: Boolean(input.getRequiredFile() === "true"),
    };
  }

  private toDomainModel(data: IApprovalWorkflowStepApiModel): ApprovalWorkflowStepEntity {

    const res = new ApprovalWorkflowStepEntity(
      data.id.toString(),
      data.approval_workflow_id.toString(),
      String(data.departmentId),
      data.step_name,
      data.step_number,
      data.user_id,
      data.type,
      String(data.requires_file),
      data.approval_workflow ? this.toApprovalWorkflowEntity(data.approval_workflow): undefined,
      data.user ? this.toUserEntity(data.user): undefined,
      data.department ? this.toDepartmentEntity(data.department): undefined,
      data.created_at || "",
      data.updated_at || "",
    );
    return res
  }

  //docType
  private toApprovalWorkflowEntity(model: ApprovalWorkflowApiModel): ApprovalWorkflowEntity {
    return new ApprovalWorkflowEntity(
      model.id.toString(),
      model.name,
      String(model.documentTypeId),
      undefined,
      [],
      model.created_at ?? '',
      model.updated_at ?? ''
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
   private toUserEntity(user: UserInterface): UserEntity {
       const roleIds = user.roles?.map((role) => role.id) || [];
       const permissionIds = user.permissions?.map((perm) => perm.id) || [];
       const roles = user.roles || [];
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
