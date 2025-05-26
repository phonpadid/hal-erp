export interface Roleinterface {
  id: number;
  name: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}
export interface RoleCreate {
  name: string;
  display_name: string;
}
export interface RoleUpdate {
  name?: string;
  display_name?: string;
}
export interface RoleResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  // display_name: string;
}
