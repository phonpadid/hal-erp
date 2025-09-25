export interface CreateDepartmentApproverDTO {
  user_id: number[];
  department_id?: number | string | null;
}

export interface UpdateDepartmentApproverDTO {
  id: string;
  user_id?: number[];
  department_id?: string | number | undefined | null;
}

export interface DepartmentApproverDTO {
  id: string;
  user_id: number[];
  department_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
