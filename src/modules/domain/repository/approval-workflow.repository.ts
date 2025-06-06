
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { ApprovalWorkflowEntity } from "../entities/approval-workflows.entity";

export interface ApprovalWorkflowRepository {
  create(input: ApprovalWorkflowEntity): Promise<ApprovalWorkflowEntity>;
  findById(id: string): Promise<ApprovalWorkflowEntity | null>;
  findAll(query: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<ApprovalWorkflowEntity>>;
  update(id: string, input: ApprovalWorkflowEntity): Promise<ApprovalWorkflowEntity>;
  delete(id: string): Promise<boolean>;
}
