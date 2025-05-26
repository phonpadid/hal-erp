import type { PermissionService } from "../ports/input/permission.service";
import type { PermissionRepository } from "../../domain/repository/permsision.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { Permission } from "@/modules/domain/entities/permission.entities";
import { GetAllPermissionUseCase } from "../useCases/permission/get-all-permission.usecase";

export class PermissionServiceImpl implements PermissionService {
  private readonly getAllPermissionUseCase: GetAllPermissionUseCase;

  constructor(private readonly permissionRepository: PermissionRepository) {
    this.getAllPermissionUseCase = new GetAllPermissionUseCase(permissionRepository);
  }

  async getAllPermission(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<Permission>> {
    return await this.getAllPermissionUseCase.execute(params, includeDeleted);
  }
}
