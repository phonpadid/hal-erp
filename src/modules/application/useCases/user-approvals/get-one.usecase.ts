
import type { UserApprovalEntity } from "@/modules/domain/entities/user-approvals/user-approval.entity";
import type { UserApprovalRepository } from "@/modules/domain/repository/user-approvals/user-approval.repository";

export class GetOneUserApprovalUseCase {
  constructor(private readonly userApprovalRepo: UserApprovalRepository) { }

  async execute(
    id: string
  ): Promise<UserApprovalEntity | null> {
    return await this.userApprovalRepo.findById(id);
  }
}
