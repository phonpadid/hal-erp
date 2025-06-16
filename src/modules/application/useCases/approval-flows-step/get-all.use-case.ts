
import type { ApprovalWorkflowStepEntity } from "@/modules/domain/entities/approval-workflows-step.entity";
import type { ApprovalWorkflowStepRepository } from "@/modules/domain/repository/approval-workflow-step.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllApprovalWorkflowStepUseCase {
  constructor(private readonly approvalWorkflowStepRepo: ApprovalWorkflowStepRepository) {}

  async execute(
    id: string,
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<ApprovalWorkflowStepEntity>> {
    return await this.approvalWorkflowStepRepo.findAll(id,params, includeDeleted);
  }
}
