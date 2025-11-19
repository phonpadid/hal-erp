import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";

export class DeleteDepartmentRoleUseCase {
  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {}

  async execute(id: string): Promise<boolean> {
    const existingDepartmentRole = await this.departmentRoleRepository.findById(id);
    if (!existingDepartmentRole) {
      throw new Error('Department role not found');
    }

    existingDepartmentRole.delete();
    // await this.departmentRoleRepository.update(id, existingDepartmentRole);
    return true;
  }
}
