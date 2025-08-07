import type { ApprovalWorkflowStepRepository } from "@/modules/domain/repository/approval-workflow-step.repository";
import type { UpdateApprovalWorkflowStepDTO } from "../../dtos/approval-workflow-step.dto";
import type { ApprovalWorkflowStepEntity } from "@/modules/domain/entities/approval-workflows-step.entity";

export class UpdateApprovalWorkflowStepUseCase {
  constructor(private readonly approvalWorkflowStepRepository: ApprovalWorkflowStepRepository) {}
  async execute(id: string, input: UpdateApprovalWorkflowStepDTO): Promise<ApprovalWorkflowStepEntity> {
    const data = await this.approvalWorkflowStepRepository.findById(id);
    if (!data) {
      throw new Error(` with id ${id} not found`);
    }
    data.update(
      input.approval_workflow_id ?? '',
      input.department_id,
      input.step_name,
      input.step_number,
      input.user_id,
      input.type,
      input.requires_file,
      input.is_otp,
    );
    return await this.approvalWorkflowStepRepository.update(id, data);
  }
}
