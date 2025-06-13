import type { ApprovalWorkflowStepRepository } from "@/modules/domain/repository/approval-workflow-step.repository";

export class DeleteApprovalWorkflowStepUseCase {
  constructor(private readonly approvalWorkflowStepRepository: ApprovalWorkflowStepRepository) {}

  async execute(id: string): Promise<boolean> {
    const res = await this.approvalWorkflowStepRepository.findById(id);
    if (!res) {
      throw new Error(` with id ${id} not found`);
    }
    if (res.isDeleted()) {
      throw new Error(` with id ${id} is already deleted`);
    }
    return await this.approvalWorkflowStepRepository.delete(id);
  }
}
