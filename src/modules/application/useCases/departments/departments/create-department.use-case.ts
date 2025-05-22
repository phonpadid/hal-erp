import type { CreateDepartmentDTO } from "@/modules/application/dtos/departments/deparment.dto";
import { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { DepartmentRepository } from "@/modules/domain/repository/departments/department.repository";
import { v4 as uuidv4 } from "uuid";

export class CreateDepartmentUseCase {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async execute(createUnitDTO: CreateDepartmentDTO): Promise<DepartmentEntity> {
    const department = DepartmentEntity.create(uuidv4(), createUnitDTO.name, createUnitDTO.code);
    return await this.departmentRepository.create(department);
  }
}
