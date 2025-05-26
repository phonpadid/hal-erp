
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { DepartmentRepository } from "@/modules/domain/repository/departments/department.repository";

export class GetOneDepartmentUseCase {
  constructor(private readonly dpmUserRepository: DepartmentRepository) { }

  async execute(
    id: string
  ): Promise<DepartmentEntity | null> {
    return await this.dpmUserRepository.findById(id);
  }
}
