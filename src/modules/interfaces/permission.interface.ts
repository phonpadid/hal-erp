export interface PermissionResponse {
  id: string;
  name: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}
export interface PermissionRequest {
  name: string;
  display_name: string;
}
