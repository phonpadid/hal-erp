import type { ApprovalWorkflowStepRepository } from "@/modules/domain/repository/approval-workflow-step.repository";
import type { CreateApprovalWorkflowStepDTO } from "../../dtos/approval-workflow-step.dto";
import { ApprovalWorkflowStepEntity } from "@/modules/domain/entities/approval-workflows-step.entity";

export class CreateApprovalWorkflowStepUseCase {
  constructor(private readonly approvalWorkflowStepRepo: ApprovalWorkflowStepRepository) { }

  async execute(input: CreateApprovalWorkflowStepDTO): Promise<ApprovalWorkflowStepEntity> {
    const res = ApprovalWorkflowStepEntity.create(
      input.approval_workflow_id,
      input.department_id,
      input.step_name,
      input.step_number,
    );
    return await this.approvalWorkflowStepRepo.create(res);
  }
}
