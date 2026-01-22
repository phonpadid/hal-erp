export interface PermissionResponse {
  id: string;
  name: string;
  display_name: string;
  display_name_lo?: string | null;
  type: string;
  permissions: {
    id: number;
    name: string;
    display_name: string;
    display_name_lo?: string | null;
  }[];
  created_at: string;
  updated_at: string;
}
export interface PermissionRequest {
  name: string;
  display_name: string;
}

export interface Permission {
  id: number;
  display_name: string;
  display_name_lo?: string | null;
}

export interface PermissionGroup {
  id: number;
  name: string;
  display_name: string;
  display_name_lo?: string | null;
  type: string;
  permissions: Permission[];
}

export interface PermissionResponse {
  data: PermissionGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
