export interface Roleinterface {
  id: number | string;
  name: string;
  display_name: string;
  department_id: number;
  department_name?: string;
  permissions: number[];
  created_at: string;
  updated_at: string;
}

export interface CreateRole {
  name: string;
}
export interface UpdateRole {
  name?: string;
}
export interface RoleResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  // display_name: string;
}
