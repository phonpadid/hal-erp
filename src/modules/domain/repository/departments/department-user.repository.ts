
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { DepartmentUserEntity } from "../../entities/departments/department-user.entity";

export interface DepartmentUserRepository {
  create(department: DepartmentUserEntity): Promise<DepartmentUserEntity>;
  findById(id: string): Promise<DepartmentUserEntity | null>;
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentUserEntity>>;
  findAllByDpm(id: string): Promise<DepartmentUserEntity[]>;
  update(id: string, department: DepartmentUserEntity): Promise<DepartmentUserEntity>;
  delete(id: string): Promise<boolean>;
}
