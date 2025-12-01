export interface CompanyUserInterface {
  id: number;
  user?: {
    username: string;
    email: string;
    tel: string;
    roles?: RoleInterface[];
    user_signature?: {
      signature_url?: string;
    };
  };
  // Keep direct properties for backward compatibility
  username?: string;
  email?: string;
  tel?: string;
  signature?: string | null;
  signature_url?: string | null;
  roles?: RoleInterface[];
  permissions?: PermissionInterface[];
  company_id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CompanyUserCreate {
  username: string;
  email: string;
  tel: string;
  password: string;
  confirm_password: string;
  signature?: string | null;
  roleIds: number[];
  permissionIds: number[];
  company_id?: number | null; // Optional but should be validated when creating user
}

export interface CompanyUserUpdate {
  username?: string;
  email?: string;
  tel?: string;
  signature?: string | null;
  roleIds?: number[];
  permissionIds?: number[];
}

export interface CompanyUserApiModel {
  id: number;
  username: string;
  email: string;
  tel: string;
  signature?: string | null;
  signature_url?: string;
  roles?: RoleInterface[];
  permissions?: PermissionInterface[];
  company_id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface RoleInterface {
  id: number;
  name: string;
  description?: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionInterface {
  id: number;
  name: string;
  description?: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyUserListPayload {
  page?: number;
  limit?: number;
  search?: string;
  company_id?: number | null;
}


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CompanyUserCreatePayload extends CompanyUserCreate {}

export interface CompanyUserUpdatePayload extends CompanyUserUpdate {
  id: number;
}