import type { UserInterface } from "../user.interface";
import type { DepartmentApiModel } from "./department.interface";

export interface DepartmentApproverApiModel {
  department_id: string | number;
  id: number;
  user_id: number;

  user?: UserInterface;
  department?: DepartmentApiModel;
  created_at?: string;
  updated_at?: string;
}
