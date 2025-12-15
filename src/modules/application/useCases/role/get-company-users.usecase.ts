import type { Role } from "@/modules/domain/entities/role.entities";
import type { RoleRepository } from "@/modules/domain/repository/role.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetCompanyUsersUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<Role>> {
    return await this.roleRepository.findCompanyUsers(params);
  }
}