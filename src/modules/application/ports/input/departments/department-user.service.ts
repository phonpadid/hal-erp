import type { CreateDepartmentUserDTO, UpdateDepartmentUserDTO } from "@/modules/application/dtos/departments/department-user.dto";
import type { DepartmentUserEntity } from "@/modules/domain/entities/departments/department-user.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface DepartmentUserService {
  createDepartmentUser(createDepartmentUserDTO: CreateDepartmentUserDTO): Promise<DepartmentUserEntity>;
  getDepartmentUserById(id: string): Promise<DepartmentUserEntity | null>;
  getAllDepartmentUser(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentUserEntity>>;
  updateDepartmentUser(id: string, updateDepartmentDTO: UpdateDepartmentUserDTO): Promise<DepartmentUserEntity>;
  deleteDepartmentUser(id: string): Promise<boolean>;
}
