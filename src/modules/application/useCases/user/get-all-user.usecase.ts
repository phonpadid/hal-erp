import type { UserRepository } from "@/modules/domain/repository/user.repository";
import type { UserEntity } from "@/modules/domain/entities/user.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<UserEntity>> {
    return await this.userRepository.findAll(params, includeDeleted);
  }
}
