<<<<<<< HEAD
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";
=======

import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
>>>>>>> 8b79029224d2bcbfa6a783a1e912f18fb2248ec4
import type { DepartmentEntity } from "../../entities/departments/department.entity";

export interface DepartmentRepository {
  create(department: DepartmentEntity): Promise<DepartmentEntity>;
  findById(id: string): Promise<DepartmentEntity | null>;
  findByName(name: string): Promise<DepartmentEntity | null>;
<<<<<<< HEAD
  findAll(
    params: PaginationParams,
    includeDeleted?: boolean
  ): Promise<PaginatedResult<DepartmentEntity>>;
  update(unit: DepartmentEntity): Promise<DepartmentEntity>;
=======
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentEntity>>;
  update(id: string, department: DepartmentEntity): Promise<DepartmentEntity>;
>>>>>>> 8b79029224d2bcbfa6a783a1e912f18fb2248ec4
  delete(id: string): Promise<boolean>;
}
