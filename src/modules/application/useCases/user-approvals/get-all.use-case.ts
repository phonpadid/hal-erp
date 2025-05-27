
import type { UserApprovalEntity } from "@/modules/domain/entities/user-approvals/user-approval.entity";
import type { UserApprovalRepository } from "@/modules/domain/repository/user-approvals/user-approval.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllUserApprovalUseCase {
  constructor(private readonly userApprovallRepo: UserApprovalRepository) {}

  async execute(
    query: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<UserApprovalEntity>> {
    return await this.userApprovallRepo.findAll(query, includeDeleted);
  }
}
