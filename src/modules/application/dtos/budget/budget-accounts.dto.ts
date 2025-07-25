export interface BudgetAccountDTO {
  id: string;
  name: string;
  fiscal_year: string;
  allocated_amount: string;
  departmentId: string;
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
