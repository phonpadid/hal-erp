
import type { ApprovalWorkflowEntity } from "@/modules/domain/entities/approval-workflows.entity";
import type { ApprovalWorkflowRepository } from "@/modules/domain/repository/approval-workflow.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllApprovalWorkflowUseCase {
  constructor(private readonly approvalWorkflowRepo: ApprovalWorkflowRepository) {}

  async execute(
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ApprovalWorkflowEntity>> {
    return await this.approvalWorkflowRepo.findAll(params, includeDeleted);
  }
}
