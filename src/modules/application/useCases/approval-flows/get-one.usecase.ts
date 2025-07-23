
import type { ApprovalWorkflowEntity } from "@/modules/domain/entities/approval-workflows.entity";
import type { ApprovalWorkflowRepository } from "@/modules/domain/repository/approval-workflow.repository";

export class GetOneApprovalWorkflowUseCase {
  constructor(private readonly approvalWorkflowRepository: ApprovalWorkflowRepository) { }

  async execute(
    id: string
  ): Promise<ApprovalWorkflowEntity | null> {
    return await this.approvalWorkflowRepository.findById(id);
  }
}
