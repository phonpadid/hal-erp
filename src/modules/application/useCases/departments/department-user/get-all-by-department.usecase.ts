import type { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";

export class GetDepartmentUserByDpmUseCase {
  constructor(private readonly dpmUserRepository: DepartmentUserRepository) { }

  async execute(
    id: string
  ): Promise<DepartmentUserEntity[]> {
    return await this.dpmUserRepository.findAllByDpm(id);
  }
}
