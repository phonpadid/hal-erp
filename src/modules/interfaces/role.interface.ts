export interface Roleinterface {
  id: number;
  name: string;
  display_name: string;
  department_id: number;
  department_name?: string;
  permissions: number[];
  created_at: string;
  updated_at: string;
}

export interface CreateRole {
  department_id?: number;
  name: string;
  permissions: number[];
}
export interface UpdateRole {
  department_id?: number;
  name?: string;
  permissions?: number[];
}
export interface RoleResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  // display_name: string;
}
