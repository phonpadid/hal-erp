import type { CreateDepartmentApproverDTO } from "@/modules/application/dtos/departments/department-approver.dto";
import { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type { DepartmentApproverRepository } from "@/modules/domain/repository/departments/department-approver.repository";
import { v4 as uuidv4 } from "uuid";
export class CreateDepartmentApproverUseCase {
  constructor(private readonly dpmApproverRepository: DepartmentApproverRepository) { }

  async execute(input: CreateDepartmentApproverDTO): Promise<DepartmentApproverEntity> {
    const dpmApprover = DepartmentApproverEntity.create(uuidv4(), input.department_id ?? '', input.user_id ?? '', );
    return await this.dpmApproverRepository.create(dpmApprover);
  }
}
