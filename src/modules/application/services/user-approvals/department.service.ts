
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { UserApprovalService } from "../../ports/input/user-approvals/user-approval.service";
import { CreateUserApprovalUseCase } from "../../useCases/user-approvals/create.use-case";
import { UpdateUserApprovalUseCase } from "../../useCases/user-approvals/update.use-case";
import { DeleteUserApprovalUseCase } from "../../useCases/user-approvals/delete.usecase";
import { GetOneUserApprovalUseCase } from "../../useCases/user-approvals/get-one.usecase";
import { GetAllUserApprovalUseCase } from "../../useCases/user-approvals/get-all.use-case";
import type { UserApprovalRepository } from "@/modules/domain/repository/user-approvals/user-approval.repository";
import type { CreateUserApprovalDTO, UpdateUserApprovalDTO } from "../../dtos/user-approvals/user-approval.dto";
import type { UserApprovalEntity } from "@/modules/domain/entities/user-approvals/user-approval.entity";

export class UserApprovalServiceImpl implements UserApprovalService {
  private readonly createUsecase: CreateUserApprovalUseCase;
  private readonly updateUsecase: UpdateUserApprovalUseCase
  private readonly deleteUsecase: DeleteUserApprovalUseCase;
  private readonly getOneUsecase: GetOneUserApprovalUseCase;
  private readonly getAllUsecase: GetAllUserApprovalUseCase;

  constructor(private readonly userApprovalRepo: UserApprovalRepository) {
    this.createUsecase = new CreateUserApprovalUseCase(userApprovalRepo);
    this.updateUsecase = new UpdateUserApprovalUseCase(userApprovalRepo);
    this.deleteUsecase = new DeleteUserApprovalUseCase(userApprovalRepo);
    this.getOneUsecase = new GetOneUserApprovalUseCase(userApprovalRepo);
    this.getAllUsecase = new GetAllUserApprovalUseCase(userApprovalRepo);
  }
  async create(input: CreateUserApprovalDTO): Promise<UserApprovalEntity> {
    return await this.createUsecase.execute(input);
  }

  async getById(id: string): Promise<UserApprovalEntity | null> {
    return await this.getOneUsecase.execute(id);
  }

  async getAll(
    query: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<UserApprovalEntity>> {
    return await this.getAllUsecase.execute(query, includeDeleted);
  }

  async update(id: string, input: UpdateUserApprovalDTO): Promise<UserApprovalEntity> {

    return await this.updateUsecase.execute(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return await this.deleteUsecase.execute(id);
  }

}
