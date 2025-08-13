
import type { PaginatedResult, PaginationParams } from "@/modules/shared/pagination";
import type { DepartmentApproverEntity } from "../../entities/departments/department-approver.entity";

export interface DepartmentApproverRepository {
  create(input: DepartmentApproverEntity): Promise<DepartmentApproverEntity>;
  createByAdmin(input: DepartmentApproverEntity): Promise<DepartmentApproverEntity>;
  findOne(id: string): Promise<DepartmentApproverEntity | null>;
  findAll(params: PaginationParams, includeDeleted?: boolean): Promise<PaginatedResult<DepartmentApproverEntity>>;
  updateByAdmin(id: string, input: DepartmentApproverEntity): Promise<DepartmentApproverEntity>;
  update(id: string, input: DepartmentApproverEntity): Promise<DepartmentApproverEntity>;
  delete(id: string): Promise<boolean>;
}
