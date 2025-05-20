import { Permission } from "./../../../domain/entities/permission.entities";

import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface PermissionService {
  getAllPermission(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<Permission>>;
}
