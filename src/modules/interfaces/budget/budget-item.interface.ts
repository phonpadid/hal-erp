export interface BudgetItemInterface {
  id: string;
  budget_account_id: string;
  name: string;
  allocated_amount: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreateBudgetItemInterface {
  budget_account_id: string;
  name: string;
  allocated_amount: string;
}
export interface UpdateBudgetItemInterface {
  id: string;
  budget_account_id: string;
  name: string;
  allocated_amount: string;
 }
