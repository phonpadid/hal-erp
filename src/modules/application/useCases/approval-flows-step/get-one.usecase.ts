
import type { ApprovalWorkflowStepEntity } from "@/modules/domain/entities/approval-workflows-step.entity";
import type { ApprovalWorkflowStepRepository } from "@/modules/domain/repository/approval-workflow-step.repository";

export class GetOneApprovalWorkflowStepUseCase {
  constructor(private readonly approvalWorkflowStepRepository: ApprovalWorkflowStepRepository) { }

  async execute(
    id: string
  ): Promise<ApprovalWorkflowStepEntity | null> {
    return await this.approvalWorkflowStepRepository.findById(id);
  }
}
