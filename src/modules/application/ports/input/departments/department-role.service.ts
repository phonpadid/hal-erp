import type { CreateDepartmentRoleDTO, UpdateDepartmentRoleDTO, DepartmentRoleWithDetailsDTO } from "@/modules/application/dtos/departments/department-role.dto";
import type { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface DepartmentRoleService {
  createDepartmentRole(input: CreateDepartmentRoleDTO): Promise<DepartmentRole>;
  getDepartmentRoleById(id: string): Promise<DepartmentRole | null>;
  getAllDepartmentRoles(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentRole>>;
  getDepartmentRolesWithDetails(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentRoleWithDetailsDTO>>;
  getDepartmentRolesByDepartment(departmentId: number): Promise<DepartmentRole[]>;
  getDepartmentRolesByRole(roleId: number): Promise<DepartmentRole[]>;
  updateDepartmentRole(id: string, input: UpdateDepartmentRoleDTO): Promise<DepartmentRole>;
  deleteDepartmentRole(id: string): Promise<boolean>;
  restoreDepartmentRole(id: string): Promise<DepartmentRole>;
}