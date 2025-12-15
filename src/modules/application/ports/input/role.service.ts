import type { Role } from "@/modules/domain/entities/role.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { CreateRole } from "@/modules/interfaces/role.interface";
import type { UpdateRole } from "@/modules/interfaces/role.interface";

export interface RoleService {
  getAllRoles(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Role>>;
  getRoleById(id: string): Promise<Role | null>;
  createRole(data: CreateRole): Promise<Role>;
  updateRole(id: string, data: UpdateRole): Promise<Role>;
  deleteRole(id: string): Promise<boolean>;
  getCompanyUsers(params: PaginationParams): Promise<PaginatedResult<Role>>;
}
