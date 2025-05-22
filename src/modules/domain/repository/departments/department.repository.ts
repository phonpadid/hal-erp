
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { DepartmentEntity } from "../../entities/departments/department.entity";

export interface DepartmentRepository {
  create(department: DepartmentEntity): Promise<DepartmentEntity>;
  findById(id: string): Promise<DepartmentEntity | null>;
  findByName(name: string): Promise<DepartmentEntity | null>;
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentEntity>>;
  update(id: string, department: DepartmentEntity): Promise<DepartmentEntity>;
  delete(id: string): Promise<boolean>;
}
