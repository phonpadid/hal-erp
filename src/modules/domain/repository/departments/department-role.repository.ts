import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { DepartmentRole } from "../../entities/departments/department-role.entity";
import type { DepartmentRoleWithDetailsDTO } from "@/modules/application/dtos/departments/department-role.dto";

export interface DepartmentRoleRepository {
  create(departmentRole: DepartmentRole): Promise<DepartmentRole>;
  findById(id: string): Promise<DepartmentRole | null>;
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentRole>>;
  findAllWithDetails(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentRoleWithDetailsDTO>>;
  findByDepartmentId(departmentId: number): Promise<DepartmentRole[]>;
  findByRoleId(roleId: number): Promise<DepartmentRole[]>;
  update(id: string, departmentRole: DepartmentRole): Promise<DepartmentRole>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<DepartmentRole>;
}