export interface BudgetItemtDTO {
  id: string;
  budget_account_id: string;
  name: string;
  allocated_amount: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreateBudgetItemDTO {
  budget_account_id: string;
  name: string;
  allocated_amount: string;
}
export interface UpdateBudgetItemDTO {
  id: string;
  budget_account_id: string;
  name: string;
  allocated_amount: string;
}
