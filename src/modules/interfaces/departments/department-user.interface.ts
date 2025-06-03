import type { PositionApiModel } from "../position.interface";
import type { UserInterface } from "../user.interface";
import type { DepartmentApiModel } from "./department.interface";

export interface DepartmentUserApiModel {
  id?: string;
  position_id?: string;
  signature_file?: string | File;
  department?: DepartmentApiModel;
  position?: PositionApiModel;
  user?: UserInterface
  created_at?: string;
  updated_at?: string;
}
