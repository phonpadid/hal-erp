import type { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";

export class GetDepartmentRolesByRoleUseCase {
  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {}

  async execute(roleId: number): Promise<DepartmentRole[]> {
    return await this.departmentRoleRepository.findByRoleId(roleId);
  }
}