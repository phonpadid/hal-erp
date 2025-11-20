import type { UpdateDepartmentRoleDTO } from "@/modules/application/dtos/departments/department-role.dto";
import type { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";

export class UpdateDepartmentRoleUseCase {
  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {}

  async execute(id: string, input: UpdateDepartmentRoleDTO): Promise<DepartmentRole> {
    const existingDepartmentRole = await this.departmentRoleRepository.findById(id);
    if (!existingDepartmentRole) {
      throw new Error('Department role not found');
    }

    if (input.role_id !== undefined) {
      existingDepartmentRole.updateRoleId(input.role_id);
    }
    if (input.department_id !== undefined) {
      existingDepartmentRole.updateDepartmentId(input.department_id);
    }
    if (input.permissions !== undefined) {
      existingDepartmentRole.updatePermissions(input.permissions);
    }

    return await this.departmentRoleRepository.update(id, existingDepartmentRole);
  }
}