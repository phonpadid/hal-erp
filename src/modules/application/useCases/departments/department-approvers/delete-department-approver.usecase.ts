import type { DepartmentApproverRepository } from "@/modules/domain/repository/departments/department-approver.repository";

export class DeleteDepartmentApproverUseCase {
  constructor(private readonly dpmApproverRepository: DepartmentApproverRepository) {}

  async execute(id: string): Promise<boolean> {
    const unit = await this.dpmApproverRepository.findOne(id);
    if (!unit) {
      throw new Error(`Unit with id ${id} not found`);
    }
    if (unit.isDeleted()) {
      throw new Error(`Unit with id ${id} is already deleted`);
    }
    return await this.dpmApproverRepository.delete(id);
  }
}
