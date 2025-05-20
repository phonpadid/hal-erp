
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { DepartmentRepository } from "@/modules/domain/repository/departments/department.repository";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export class GetAllDepartmentUseCase {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async execute(
    params: PaginationParams = { page: 1, limit: 10 },
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentEntity>> {
    return await this.departmentRepository.findAll(params, includeDeleted);
  }
}
