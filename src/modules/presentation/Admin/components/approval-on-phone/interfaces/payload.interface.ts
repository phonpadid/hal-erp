import type { Permission } from "@/modules/interfaces/permission.interface"
import type { Role } from "@/modules/interfaces/user.interface"

export interface JwtPayload {
  id: string
  step_id: string
  user_id: number
  email: string
  iat: number
  exp: number
}

export interface IStep {
  id: number,
  status_id: number
}
export interface IRole {
  id: number,
  name: string
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_signature?: any;
  roles: Role[];
  permissions: Permission[];
}
