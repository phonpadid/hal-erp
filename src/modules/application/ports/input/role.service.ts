import type { Role } from "@/modules/domain/entities/role.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { RoleCreate } from "@/modules/interfaces/role.interface";
import type { RoleUpdate } from "@/modules/interfaces/role.interface";

export interface RoleService {
  getAllRoles(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Role>>;
  getRoleById(id: string): Promise<Role | null>;
  createRole(data: RoleCreate): Promise<Role>;
  updateRole(id: string, data: RoleUpdate): Promise<Role>;
  deleteRole(id: string): Promise<boolean>;
}
