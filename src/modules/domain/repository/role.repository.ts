import { Role } from "../entities/role.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface RoleRepository {
  findRoleAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Role>>;
}
