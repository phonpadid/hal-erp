import type { UserApprovalRepository } from "@/modules/domain/repository/user-approvals/user-approval.repository";

export class DeleteUserApprovalUseCase {
  constructor(private readonly userApprovalRepository: UserApprovalRepository) {}

  async execute(id: string): Promise<boolean> {
    const userApproval = await this.userApprovalRepository.findById(id);
    if (!userApproval) {
      throw new Error(`userApproval with id ${id} not found`);
    }
    if (userApproval.isDeleted()) {
      throw new Error(`userApproval with id ${id} is already deleted`);
    }
    return await this.userApprovalRepository.delete(id);
  }
}
