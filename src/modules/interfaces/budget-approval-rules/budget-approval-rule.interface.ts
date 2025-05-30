import type { DepartmentApiModel } from "../departments/department.interface";
import type { UserInterface } from "../user.interface";

export interface BudgetApprovalRuleApiModel {
  id: string;
  department_id: number;
  approver_id: number;
  min_amount: number;
  max_amount: number;
  department?: DepartmentApiModel;
  approver?: UserInterface;
  created_at?: string;
  updated_at?: string;
}
