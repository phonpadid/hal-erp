import type { CreateDepartmentRoleDTO } from "@/modules/application/dtos/departments/department-role.dto";
import { DepartmentRole } from "@/modules/domain/entities/departments/department-role.entity";
import type { DepartmentRoleRepository } from "@/modules/domain/repository/departments/department-role.repository";
import { v4 as uuidv4 } from "uuid";

export class CreateDepartmentRoleUseCase {
  constructor(private readonly departmentRoleRepository: DepartmentRoleRepository) {}

  async execute(input: CreateDepartmentRoleDTO): Promise<DepartmentRole> {
    const departmentRole = DepartmentRole.create(uuidv4(), input.role_id, input.department_id, input.permissions);
    return await this.departmentRoleRepository.create(departmentRole);
  }
}