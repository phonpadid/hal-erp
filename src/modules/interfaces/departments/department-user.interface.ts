import type { PermissionResponse } from "../permission.interface";
import type { PositionApiModel } from "../position.interface";
import type { Roleinterface } from "../role.interface";
import type { UserInterface } from "../user.interface";
import type { DepartmentApiModel } from "./department.interface";

export interface DepartmentUserApiModel {
  id?: string;
  userId?: string;
  position_id?: string;
  signature_file?: string | File;
  signature_file_url?: string ;
  department_id: number;
  permissionIds: number[];
  roleIds: number[];
  user_type: string[];
  department?: DepartmentApiModel;
  position?: PositionApiModel;
  roles?: Roleinterface;
  permissions?: PermissionResponse
  user?: UserInterface
  created_at?: string;
  updated_at?: string;
}
