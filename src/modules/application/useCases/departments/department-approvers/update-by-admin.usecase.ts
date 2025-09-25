import type { UpdateDepartmentApproverDTO } from "@/modules/application/dtos/departments/department-approver.dto";
import type { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type { DepartmentApproverRepository } from "@/modules/domain/repository/departments/department-approver.repository";
export class UpdateDepartmentApproverAdminUseCase {
  constructor(private readonly dpmAproverRepository: DepartmentApproverRepository) {}

  async execute(id: string, input: UpdateDepartmentApproverDTO): Promise<DepartmentApproverEntity> {
    const dpmUser = await this.dpmAproverRepository.findOne(id);
    if (!dpmUser) {
      throw new Error(` with id ${id} not found`);
    }

    const userIds = input.user_id?.map(String) ?? []; // แปลงอาร์เรย์ของ number เป็นอาร์เรย์ของ string
    const departmentId = String(input.department_id ?? '');

    dpmUser.updatedByAdmin(departmentId, userIds);
    return await this.dpmAproverRepository.updateByAdmin(id, dpmUser);
  }
}
