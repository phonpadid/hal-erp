export interface CreateUserDTO {
  username: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  password?: string;
  tel: string;
  roleIds: number[];
  permissionIds: number[];
}

export interface UpdateUserDTO {
  name: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  password: string;
  tel: string;
  roleIds: number[];
  permissionIds: number[];
}
export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export interface UserDTO {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  password: string;
  tel: string;
  roleIds: number[];
  permissionIds: number[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
