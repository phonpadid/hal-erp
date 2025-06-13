
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { ApprovalWorkflowStepEntity } from "../entities/approval-workflows-step.entity";

export interface ApprovalWorkflowStepRepository {
  create(input: ApprovalWorkflowStepEntity): Promise<ApprovalWorkflowStepEntity>;
  findById(id: string): Promise<ApprovalWorkflowStepEntity | null>;
  findAll(query: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ApprovalWorkflowStepEntity>>;
  update(id: string, input: ApprovalWorkflowStepEntity): Promise<ApprovalWorkflowStepEntity>;
  delete(id: string): Promise<boolean>;
}
