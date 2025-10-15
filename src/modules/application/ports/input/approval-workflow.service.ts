import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type {
  ApprovalStatusDto,
  CreateApprovalWorkflowDTO,
  UpdateApprovalWorkflowDTO,
} from "../../dtos/approval-workflow.dto";
import type { ApprovalWorkflowEntity } from "@/modules/domain/entities/approval-workflows.entity";

export interface ApprovalWorkflowService {
  create(input: CreateApprovalWorkflowDTO): Promise<ApprovalWorkflowEntity>;
  getOne(id: string): Promise<ApprovalWorkflowEntity | null>;
  getAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<ApprovalWorkflowEntity>>;
  update(id: string, input: UpdateApprovalWorkflowDTO): Promise<ApprovalWorkflowEntity>;
  approvalStatus(id: number, input: ApprovalStatusDto): Promise<ApprovalStatusDto>;
  delete(id: string): Promise<boolean>;
}
