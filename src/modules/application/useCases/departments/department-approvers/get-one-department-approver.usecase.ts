import type { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type { DepartmentApproverRepository } from "@/modules/domain/repository/departments/department-approver.repository";

export class GetOneDepartmentApproverUseCase {
  constructor(private readonly dpmApproverRepository: DepartmentApproverRepository) { }

  async execute(
    id: string
  ): Promise<DepartmentApproverEntity | null> {
    return await this.dpmApproverRepository.findOne(id);
  }
}
