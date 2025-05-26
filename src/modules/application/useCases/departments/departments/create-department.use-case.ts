import type { CreateDepartmentDTO } from "@/modules/application/dtos/departments/department.dto";
import { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { DepartmentRepository } from "@/modules/domain/repository/departments/department.repository";
import { v4 as uuidv4 } from "uuid";

export class CreateDepartmentUseCase {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async execute(input: CreateDepartmentDTO): Promise<DepartmentEntity> {
    const department = DepartmentEntity.create(uuidv4(), input.name, input.code);
    return await this.departmentRepository.create(department);
  }
}
