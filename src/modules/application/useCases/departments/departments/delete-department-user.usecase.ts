import type { DepartmentRepository } from "@/modules/domain/repository/departments/department.repository";

export class DeleteDepartmentUseCase {
  constructor(private readonly dpmUserRepository: DepartmentRepository) {}

  async execute(id: string): Promise<boolean> {
    const unit = await this.dpmUserRepository.findById(id);
    if (!unit) {
      throw new Error(`Unit with id ${id} not found`);
    }
    if (unit.isDeleted()) {
      throw new Error(`Unit with id ${id} is already deleted`);
    }
    return await this.dpmUserRepository.delete(id);
  }
}
