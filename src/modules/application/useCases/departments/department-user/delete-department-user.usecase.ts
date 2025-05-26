import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";

export class DeleteDepartmentUserUseCase {
  constructor(private readonly dpmUserRepository: DepartmentUserRepository) {}

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
