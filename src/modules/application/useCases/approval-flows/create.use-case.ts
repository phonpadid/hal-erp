import type { ApprovalWorkflowRepository } from "@/modules/domain/repository/approval-workflow.repository";
import type { CreateApprovalWorkflowDTO } from "../../dtos/approval-workflow.dto";
import { ApprovalWorkflowEntity } from "@/modules/domain/entities/approval-workflows.entity";
import type { ApprovalWorkflowStepApiModel } from "@/modules/interfaces/approval-workflow-step.interface";

export class CreateApprovalWorkflowUseCase {
  constructor(private readonly approvalWorkflowRepo: ApprovalWorkflowRepository) {}

  async execute(input: CreateApprovalWorkflowDTO): Promise<ApprovalWorkflowEntity> {
    const res = ApprovalWorkflowEntity.create(
      input.name,
      input.document_type_id,
      input.steps.map((item): ApprovalWorkflowStepApiModel => ({
        approval_workflow_id: Number(item.approval_workflow_id),
        step_name: item.step_name,
        step_number: item.step_number,
        type: item.type,
        departmentId: Number(item.department_id),
        userId: Number(item.user_id),
        requires_file: item.requires_file === "true",
        is_otp: item.is_otp === "true"
      }))
    );
    return await this.approvalWorkflowRepo.create(res);
  }
}
