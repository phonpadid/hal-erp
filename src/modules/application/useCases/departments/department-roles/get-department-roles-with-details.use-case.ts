import type { DepartmentRoleWithDetailsDTO } from "@/modules/application/dtos/departments/department-role.dto";
import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetDepartmentRolesWithDetailsUseCase {
  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {}

  async execute(params: PaginationParams, includeDeleted: boolean = false): Promise<PaginatedResult<DepartmentRoleWithDetailsDTO>> {
    return await this.departmentRoleRepository.findAllWithDetails(params, includeDeleted);
  }
}