import type { RoleRepository } from "./../../../domain/repository/role.repository";
import type { Role } from "./../../../domain/entities/role.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllRolesUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Role>> {
    return await this.roleRepository.findRoleAll(params, includeDeleted);
  }
}
