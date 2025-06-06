export interface CreateDepartmentApproverDTO {
  user_id: string | null | number;
}

export interface UpdateDepartmentApproverDTO {
  id: string;
  user_id: string;
}

export interface DepartmentApproverDTO {
  id: string;
  user_id: string;
  department_id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
