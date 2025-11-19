import type { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllDepartmentRoleUseCase {
  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {}

  async execute(params: PaginationParams, includeDeleted: boolean = false): Promise<PaginatedResult<DepartmentRole>> {
    return await this.departmentRoleRepository.findAll(params, includeDeleted);
  }
}