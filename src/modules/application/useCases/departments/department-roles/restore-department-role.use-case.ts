import type { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";

export class RestoreDepartmentRoleUseCase {
  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {}

  async execute(id: string): Promise<DepartmentRole> {
    const existingDepartmentRole = await this.departmentRoleRepository.findById(id);
    if (!existingDepartmentRole) {
      throw new Error('Department role not found');
    }

    if (!existingDepartmentRole.isDeleted()) {
      throw new Error('Department role is not deleted');
    }

    existingDepartmentRole.restore();
    return await this.departmentRoleRepository.restore(id);
  }
}