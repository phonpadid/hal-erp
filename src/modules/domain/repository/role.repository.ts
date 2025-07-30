import type { Role } from "../entities/role.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface RoleRepository {
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Role>>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  create(data: { name: string; display_name: string }): Promise<Role>;
  update(id: string, role: Role): Promise<Role>;
  delete(id: string): Promise<boolean>;
}
