import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";

export class DeleteDepartmentUserUseCase {
  constructor(private readonly dpmUserRepository: DepartmentUserRepository) {}

  async execute(id: string): Promise<boolean> {
    const res = await this.dpmUserRepository.findById(id);
    if (!res) {
      throw new Error(`res with id ${id} not found`);
    }
    if (res.isDeleted()) {
      throw new Error(`res with id ${id} is already deleted`);
    }
    const userId = res.getUser()?.getId() ?? ''
    return await this.dpmUserRepository.delete(userId);
  }
}
