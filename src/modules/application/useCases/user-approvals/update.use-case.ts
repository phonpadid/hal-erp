import type { UserApprovalRepository } from "@/modules/domain/repository/user-approvals/user-approval.repository";
import type { UpdateUserApprovalDTO } from "../../dtos/user-approvals/user-approval.dto";
import type { UserApprovalEntity } from "@/modules/domain/entities/user-approvals/user-approval.entity";

export class UpdateUserApprovalUseCase {
  constructor(private readonly userApprovalRepo: UserApprovalRepository) {}
  async execute(id: string, input: UpdateUserApprovalDTO): Promise<UserApprovalEntity> {
    const userApproval = await this.userApprovalRepo.findById(id);
    if (!userApproval) {
      throw new Error(`Unit with id ${id} not found`);
    }
    userApproval.updated(input.document_id, input.approval_workflow_id, input.status_id);
    return await this.userApprovalRepo.update(id, userApproval);
  }
}
