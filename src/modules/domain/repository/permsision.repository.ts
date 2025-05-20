import type { Permission } from "../entities/permission.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface PermissionRepository {
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Permission>>;
}
