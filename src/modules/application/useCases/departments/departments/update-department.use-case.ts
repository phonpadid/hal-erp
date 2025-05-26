import type { UpdateDepartmentDTO } from "@/modules/application/dtos/departments/department.dto";
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { DepartmentRepository } from "@/modules/domain/repository/departments/department.repository";

export class UpdateDepartmentUseCase {
  constructor(private readonly departmentRepository: DepartmentRepository) {}
  async execute(id: string, input: UpdateDepartmentDTO): Promise<DepartmentEntity> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new Error(`Unit with id ${id} not found`);
    }
    department.updateDpm(input.name, input.code);
    return await this.departmentRepository.update(id, department);
  }
}
