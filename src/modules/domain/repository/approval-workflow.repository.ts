
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { ApprovalWorkflowEntity } from "../entities/approval-workflows.entity";
import type { ApprovalStatusDto, SendApprovalMailDto } from "@/modules/application/dtos/approval-workflow.dto";

export interface ApprovalWorkflowRepository {
  create(input: ApprovalWorkflowEntity): Promise<ApprovalWorkflowEntity>;
  findById(id: string): Promise<ApprovalWorkflowEntity | null>;
  findAll(query: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ApprovalWorkflowEntity>>;
  update(id: string, input: ApprovalWorkflowEntity): Promise<ApprovalWorkflowEntity>;
  approvalStatus(id: number, input: ApprovalStatusDto): Promise<ApprovalStatusDto>;
  sendApprovalMail(id: number, input: SendApprovalMailDto): Promise<ApprovalWorkflowEntity>;
  delete(id: string): Promise<boolean>;
}
