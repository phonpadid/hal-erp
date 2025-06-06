import type { ApprovalWorkflowRepository } from "@/modules/domain/repository/approval-workflow.repository";
import type { UpdateApprovalWorkflowDTO } from "../../dtos/approval-workflow.dto";
import type { ApprovalWorkflowEntity } from "@/modules/domain/entities/approval-workflows.entity";

export class UpdateApprovalWorkflowUseCase {
  constructor(private readonly approvalWorkflowRepository: ApprovalWorkflowRepository) {}
  async execute(id: string, input: UpdateApprovalWorkflowDTO): Promise<ApprovalWorkflowEntity> {
    const data = await this.approvalWorkflowRepository.findById(id);
    if (!data) {
      throw new Error(` with id ${id} not found`);
    }
    data.update(input.name, input.document_type_id);
    return await this.approvalWorkflowRepository.update(id, data);
  }
}
