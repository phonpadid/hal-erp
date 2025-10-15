import type { ApprovalWorkflowRepository } from "@/modules/domain/repository/approval-workflow.repository";
import type { ApprovalStatusDto } from "../../dtos/approval-workflow.dto";

export class ApprovalStatusUseCase {
  constructor(private readonly repo: ApprovalWorkflowRepository) {}

  async execute(id: number, input: ApprovalStatusDto): Promise<ApprovalStatusDto> {

    return await this.repo.approvalStatus(id, input);
  }
}
