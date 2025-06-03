import type { ApprovalWorkflowRepository } from "@/modules/domain/repository/approval-workflow.repository";
import type { CreateApprovalWorkflowDTO } from "../../dtos/approval-workflow.dto";
import { ApprovalWorkflowEntity } from "@/modules/domain/entities/approval-workflows.entity";

export class CreateApprovalWorkflowUseCase {
  constructor(private readonly approvalWorkflowRepo: ApprovalWorkflowRepository) {}

  async execute(input: CreateApprovalWorkflowDTO): Promise<ApprovalWorkflowEntity> {
    const res = ApprovalWorkflowEntity.create(input.name, input.document_type_id);
    return await this.approvalWorkflowRepo.create(res);
  }
}
