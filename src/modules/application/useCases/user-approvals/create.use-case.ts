import type { CreateUserApprovalDTO } from "@/modules/application/dtos/user-approvals/user-approval.dto";
import { UserApprovalEntity } from "@/modules/domain/entities/user-approvals/user-approval.entity";
import type { UserApprovalRepository } from "@/modules/domain/repository/user-approvals/user-approval.repository";
import { v4 as uuidv4 } from "uuid";

export class CreateUserApprovalUseCase {
  constructor(private readonly userApprovalRepository: UserApprovalRepository) {}

  async execute(input: CreateUserApprovalDTO): Promise<UserApprovalEntity> {
    const userApproval = UserApprovalEntity.create(uuidv4(), input.document_id, input.status_id, input.approval_workflow_id);
    return await this.userApprovalRepository.create(userApproval);
  }
}
