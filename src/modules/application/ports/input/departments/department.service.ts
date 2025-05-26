import type { CreateDepartmentDTO, UpdateDepartmentDTO } from "@/modules/application/dtos/departments/department.dto";
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface DepartmentService {
  createDepartment(input: CreateDepartmentDTO): Promise<DepartmentEntity>;
  getDepartmentById(id: string): Promise<DepartmentEntity | null>;
  getAllDepartments(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentEntity>>;
  updateDepartment(id: string, input: UpdateDepartmentDTO): Promise<DepartmentEntity>;
  deleteDepartment(id: string): Promise<boolean>;
}
