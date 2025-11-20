import type { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";

export class GetDepartmentRolesByDepartmentUseCase {
  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {}

  async execute(departmentId: number): Promise<DepartmentRole[]> {
    return await this.departmentRoleRepository.findByDepartmentId(departmentId);
  }
}