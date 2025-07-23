import type { ApprovalWorkflowRepository } from "@/modules/domain/repository/approval-workflow.repository";

export class DeleteApprovalWorkflowUseCase {
  constructor(private readonly approvalWorkflowRepository: ApprovalWorkflowRepository) {}

  async execute(id: string): Promise<boolean> {
    const res = await this.approvalWorkflowRepository.findById(id);
    if (!res) {
      throw new Error(` with id ${id} not found`);
    }
    if (res.isDeleted()) {
      throw new Error(` with id ${id} is already deleted`);
    }
    return await this.approvalWorkflowRepository.delete(id);
  }
}
