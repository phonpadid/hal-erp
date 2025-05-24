import type { CreateDepartmentUserDTO, UpdateDepartmentUserDTO } from "@/modules/application/dtos/departments/department-user.dto";
import type { DepartmentApproverEntity } from "@/modules/domain/entities/departments/department-approver.entity";
import type { PaginationParams, PaginatedResult } from "@/modules/shared/pagination";

export interface DepartmentApproverService {
  created(input: CreateDepartmentUserDTO): Promise<DepartmentApproverEntity>;
  getOne(id: string): Promise<DepartmentApproverEntity | null>;
  getAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentApproverEntity>>;
  updated(id: string, input: UpdateDepartmentUserDTO): Promise<DepartmentApproverEntity>;
  deleted(id: string): Promise<boolean>;
}
