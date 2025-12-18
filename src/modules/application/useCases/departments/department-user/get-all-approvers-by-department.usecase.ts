import type { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import type { DepartmentUserRepository } from "@/modules/domain/repository/departments/department-user.repository";

export class GetDepartmentUserApproversByDpmUseCase {
  constructor(private readonly dpmUserRepository: DepartmentUserRepository) {}

  async execute(params: {
    page: number;
    limit: number;
    search?: string;
    department_id: string;
    sort_order?: 'ASC' | 'DESC';
  }): Promise<DepartmentUserEntity[]> {
    return await this.dpmUserRepository.findAllApproversByDpm(params);
  }
}