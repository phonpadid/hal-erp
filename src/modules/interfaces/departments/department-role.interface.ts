export interface DepartmentRoleApiModel {
  id: number;
  role_id: number;
  department_id: number;
  permissions: number[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface DepartmentRoleWithDetailsApiModel extends DepartmentRoleApiModel {
  name?: string;
  role_display_name?: string;
  department_name?: string;
  department_code?: string;
}
