import type { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";

export class GetDepartmentUserUseCase {
  constructor(private readonly dpmUserRepository: DepartmentUserRepository) { }

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentUserEntity>> {
    return await this.dpmUserRepository.findAll(params, includeDeleted);
  }
}
