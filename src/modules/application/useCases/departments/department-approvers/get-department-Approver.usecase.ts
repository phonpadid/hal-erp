import type { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type { DepartmentApproverRepository } from "@/modules/domain/repository/departments/department-approver.repository";
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";

export class GetAllDepartmentApproverUseCase {
  constructor(private readonly dpmApproverRepository: DepartmentApproverRepository) { }

  async execute(
    params: PaginationParams,
    includeDeleted: boolean = false
  ): Promise<PaginatedResult<DepartmentApproverEntity>> {
    return await this.dpmApproverRepository.findAll(params, includeDeleted);
  }
}
