import type { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";

export class GetOneDepartmentRoleUseCase {
  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {}

  async execute(id: string): Promise<DepartmentRole | null> {
    return await this.departmentRoleRepository.findById(id);
  }
}