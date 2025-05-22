import type { UpdateDepartmentDTO } from "@/modules/application/dtos/departments/deparment.dto";
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { DepartmentRepository } from "@/modules/domain/repository/departments/department.repository";

export class UpdateDepartmentUseCase {
  constructor(private readonly departmentRepository: DepartmentRepository) {}
  async execute(id: string, updateDepartmenttDTO: UpdateDepartmentDTO): Promise<DepartmentEntity> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new Error(`Unit with id ${id} not found`);
    }
    if (department.getName() !== updateDepartmenttDTO.name) {
      const existingUnit = await this.departmentRepository.findByName(updateDepartmenttDTO.name);
      if (existingUnit && existingUnit.getId() !== id) {
        throw new Error(`Unit with name ${updateDepartmenttDTO.name} already exists`);
      }
    }
    department.updateName(updateDepartmenttDTO.name, updateDepartmenttDTO.code);
    return await this.departmentRepository.update(id, department);
  }
}
