import { Role } from "@/modules/domain/entities/role.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface RoleService {
  getAllRoles(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Role>>;
}
