import type { CreateUserApprovalDTO, UpdateUserApprovalDTO } from "@/modules/application/dtos/user-approvals/user-approval.dto";
import type { UserApprovalEntity } from "@/modules/domain/entities/user-approvals/user-approval.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface UserApprovalService {
  create(input: CreateUserApprovalDTO): Promise<UserApprovalEntity>;
  getById(id: string): Promise<UserApprovalEntity | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<UserApprovalEntity>>;
  update(id: string, input: UpdateUserApprovalDTO): Promise<UserApprovalEntity>;
  delete(id: string): Promise<boolean>;
}
