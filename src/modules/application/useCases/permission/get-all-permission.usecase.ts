import type { Permission } from "@/modules/domain/entities/permission.entities";
import type { PermissionRepository } from "@/modules/domain/repository/permsision.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllPermissionUseCase {
  constructor(private readonly roleRepository: PermissionRepository) {}

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Permission>> {
    return await this.roleRepository.findAll(params, includeDeleted);
  }
}
