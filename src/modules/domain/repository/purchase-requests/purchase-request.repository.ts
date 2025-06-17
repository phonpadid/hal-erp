
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { UserApprovalEntity } from "../../entities/user-approvals/user-approval.entity";

export interface UserApprovalRepository {
  create(input: UserApprovalEntity): Promise<UserApprovalEntity>;
  findById(id: string): Promise<UserApprovalEntity | null>;
  findAll(query: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<UserApprovalEntity>>;
  update(id: string, input: UserApprovalEntity): Promise<UserApprovalEntity>;
  delete(id: string): Promise<boolean>;
}
