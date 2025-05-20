import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
import type { DepartmentEntity } from "../../entities/departments/department.entity";

export interface DepartmentRepository {
  create(unit: DepartmentEntity): Promise<DepartmentEntity>;
  findById(id: string): Promise<DepartmentEntity | null>;
  findByName(name: string): Promise<DepartmentEntity | null>;
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<DepartmentEntity>>;
  update(unit: DepartmentEntity): Promise<DepartmentEntity>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}
