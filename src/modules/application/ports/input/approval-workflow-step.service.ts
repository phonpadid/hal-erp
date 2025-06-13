import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateApprovalWorkflowStepDTO, UpdateApprovalWorkflowStepDTO } from "../../dtos/approval-workflow-step.dto";
import type { ApprovalWorkflowStepEntity } from "@/modules/domain/entities/approval-workflows-step.entity";

export interface ApprovalWorkflowStepService {
  create(input: CreateApprovalWorkflowStepDTO): Promise<ApprovalWorkflowStepEntity>;
  getOne(id: string): Promise<ApprovalWorkflowStepEntity | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ApprovalWorkflowStepEntity>>;
  update(id: string, input: UpdateApprovalWorkflowStepDTO): Promise<ApprovalWorkflowStepEntity>;
  delete(id: string): Promise<boolean>;
}
