export interface BudgetAccountDTO {
  id: string;
  code: string;
  name: string;
  fiscal_year: string;
  allocated_amount: string;
  balance_amount: number | string,
  used_amount: number | string,
  total_budget?: number | string | null,
  departmentId: string;
  description?: string;
  type: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreateBudgetAccountDTO {
  name: string;
  fiscal_year: string | number;
  allocated_amount: string | number;
  departmentId: string | number;
}
export interface UpdateBudgetAccountDTO {
  id: string | number;
  name: string;
  fiscal_year: string | number;
  allocated_amount: string | number;
  departmentId: string | number;
}
