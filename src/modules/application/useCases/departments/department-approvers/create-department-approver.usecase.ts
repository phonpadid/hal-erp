import type { CreateDepartmentApproverDTO } from "@/modules/application/dtos/departments/department-approver.dto";
import { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type { DepartmentApproverRepository } from "@/modules/domain/repository/departments/department-approver.repository";
export class CreateDepartmentApproverUseCase {
  constructor(private readonly dpmApproverRepository: DepartmentApproverRepository) { }

  async execute(input: CreateDepartmentApproverDTO): Promise<DepartmentApproverEntity> {
    const userIds = input.user_id.map(String);

    const dpmApprover = DepartmentApproverEntity.create(userIds);
    return await this.dpmApproverRepository.create(dpmApprover);
  }
}
