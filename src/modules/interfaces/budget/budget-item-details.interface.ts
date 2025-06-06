export interface BudgetItemDetailsInterface {
  id: string;
  budget_item_id: string;
  name: string;
  province_id?: string;
  description?: string;
  allocated_amount: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreateBudgetItemDetailsInterface {
  budget_item_id: string;
  name: string;
  province_id?: string;
  description?: string;
  allocated_amount?: string;
}
export interface UpdateBudgetItemDetailsInterface {
  id: string;
  budget_item_id: string;
  name: string;
  province_id?: string;
  description?: string;
  allocated_amount?: string;
}
