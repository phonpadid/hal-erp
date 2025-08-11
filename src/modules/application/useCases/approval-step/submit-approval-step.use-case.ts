// modules/approvals/application/use-cases/submit-approval-step.use-case.ts
import { ApprovalStepEntity } from "@/modules/domain/entities/approval-step.entity";
import type { ApprovalStepRepository } from "@/modules/domain/repository/approval-step.repository";
import type { SubmitApprovalStepInterface } from "@/modules/interfaces/approval-step.interface";

export class SubmitApprovalStepUseCase {
  constructor(private readonly approvalStepRepo: ApprovalStepRepository) {}

  async execute(documentId: string, dto: SubmitApprovalStepInterface): Promise<boolean> {
    const approvalStepEntity = ApprovalStepEntity.create(dto);

    const result = await this.approvalStepRepo.submit(documentId, approvalStepEntity);

    return result;
  }
}
