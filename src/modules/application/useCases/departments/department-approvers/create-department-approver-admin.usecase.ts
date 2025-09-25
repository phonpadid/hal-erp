import type { CreateDepartmentApproverDTO } from "@/modules/application/dtos/departments/department-approver.dto";
import { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type { DepartmentApproverRepository } from "@/modules/domain/repository/departments/department-approver.repository";
// ...
export class CreateDepartmentApproverAdminUseCase {
  constructor(private readonly dpmApproverRepository: DepartmentApproverRepository) { }

  async execute(input: CreateDepartmentApproverDTO): Promise<DepartmentApproverEntity> {
    const userIds = input.user_id.map(String); 
    const departmentId = String(input.department_id ?? '');

    const dpmApprover = DepartmentApproverEntity.createByAdmin(departmentId, userIds);
    return await this.dpmApproverRepository.createByAdmin(dpmApprover);
  }
}
