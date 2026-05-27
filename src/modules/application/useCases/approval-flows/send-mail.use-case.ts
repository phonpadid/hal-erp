import type { ApprovalWorkflowRepository } from "@/modules/domain/repository/approval-workflow.repository";
import type { ApprovalWorkflowEntity } from "@/modules/domain/entities/approval-workflows.entity";
import type { SendApprovalMailDto } from "../../dtos/approval-workflow.dto";

export class SendApprovalMailUseCase {
  constructor(private readonly repo: ApprovalWorkflowRepository) {}

  async execute(id: number, input: SendApprovalMailDto): Promise<ApprovalWorkflowEntity> {
    return await this.repo.sendApprovalMail(id, input);
  }
}
