
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { DepartmentUserEntity } from "../../entities/departments/department-user.entity";

export interface DepartmentUserRepository {
  create(department: DepartmentUserEntity): Promise<DepartmentUserEntity>;
  findById(id: string): Promise<DepartmentUserEntity | null>;
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentUserEntity>>;
  findAllByDpm(id: string): Promise<DepartmentUserEntity[]>;
  findAllApproversByDpm(params: {
    page: number;
    limit: number;
    search?: string;
    department_id: string;
    sort_order?: 'ASC' | 'DESC';
  }): Promise<DepartmentUserEntity[]>;
  update(id: string, department: DepartmentUserEntity): Promise<DepartmentUserEntity>;
  delete(id: string): Promise<boolean>;
}
