import type { CreateRole ,UpdateRole} from "@/modules/interfaces/role.interface";
import type { Role } from "../entities/role.entities";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface RoleRepository {
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<Role>>;
  findById(id: string | number): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  create(data: CreateRole): Promise<Role>;
  update(id: string, data: UpdateRole): Promise<Role>;
  delete(id: string | number): Promise<boolean>;
  findCompanyUsers(params: PaginationParams): Promise<PaginatedResult<Role>>;
}
