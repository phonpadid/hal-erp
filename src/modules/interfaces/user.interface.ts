/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserInterface {
  getId(): string;
  id: number;
  username: string;
  email: string;
  password?: string;
  tel?: string;
  roles: Role[];
  roleIds: number[];
  permissionIds: number[];
  user_types?: string[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  getRoles(): Role[];
  permissions?: Permission[];
  user_signature?: ShowSignature_url | null;
  signature:string | File;

}
export interface ShowSignature_url{
  id: string;
  user_id: number;
  signature: string;
  signature_url: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreatePayload {
  username: string;
  email: string;
  password?: string;
  tel?: string;
  roleIds: number[];
  permissionIds: number[];
  signature:string
}

export interface UserUpdatePayload {
  username?: string;
  email?: string;
  password?: string;
  tel?: string;
  roleIds: number[];
  permissionIds: number[];
  signature:string
}
export interface UserChangePasswordPayload {
  old_password?: string;
  new_password: string;
}
export interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  permissions: any[];
}

interface Permission {
  id: number;
  name: string;
}
export interface UserAPIResponse {
  id: number;
  username: string;
  email: string;
  tel?: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: Permission[];
  user_signature?: ShowSignature_url | null;
}
