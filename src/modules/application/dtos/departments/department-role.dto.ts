export interface CreateDepartmentRoleDTO {
  role_id: number;
  department_id: number;
  permissions: number[];
}

export interface UpdateDepartmentRoleDTO {
  id: string;
  role_id?: number;
  department_id?: number;
  permissions?: number[];
}

export interface DepartmentRoleDTO {
  id: string;
  role_id: number;
  department_id: number;
  permissions: number[];
  created_at: string;
  updated_at: string;
  deletedAt: string | null;
}

export interface DepartmentRoleWithDetailsDTO extends DepartmentRoleDTO {
  name?: string;
  role_display_name?: string;
  department_name?: string;
  department_code?: string;
}
