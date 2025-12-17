import type { DepartmentApiModel } from "../departments/department.interface";

export interface BudgetAccountInterface {
  id: number | string;
  code: string;
  name: string;
  department_id: number | string;
  departmentId: number | string;
  fiscal_year: number | string;
  allocated_amount: number | string;
  balance_amount: number | string;
  used_amount: number | string;
  total_budget?: number | string | null;
  increase_amount?: number | string | null;
  type: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  department?: DepartmentApiModel;
}

export interface CreateBudgetAccountInterface {
  name: string;
  fiscal_year: number | string;
  allocated_amount: number | string;
  departmentId: number | string;
}

export interface UpdateBudgetAccountInterface {
  id: string | number;

  name: string;
  fiscal_year: string | number;
  allocated_amount: number | string;
  departmentId: number | string;
}
