import type { CreateDepartmentDTO, UpdateDepartmentDTO } from "@/modules/application/dtos/departments/deparment.dto";
import type { DepartmentEntity } from "@/modules/domain/entities/departments/department.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface DepartmentService {
  createDepartment(createDepartmentDTO: CreateDepartmentDTO): Promise<DepartmentEntity>;
  getDepartmentById(id: string): Promise<DepartmentEntity | null>;
  getDepartmentByName(name: string): Promise<DepartmentEntity | null>;
  getAllDepartments(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentEntity>>;
  updateDepartment(id: string, updateDepartmentDTO: UpdateDepartmentDTO): Promise<DepartmentEntity>;
  deleteDepartment(id: string): Promise<boolean>;
  restoreUnit(id: string): Promise<boolean>;
}
