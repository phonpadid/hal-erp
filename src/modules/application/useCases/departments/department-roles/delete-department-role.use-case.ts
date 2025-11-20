import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";

export class DeleteDepartmentRoleUseCase {
  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.departmentRoleRepository.delete(id);
  }
}
