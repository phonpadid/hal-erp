export interface BudgetItemDetailsDTO {
  id: string;
  // budget_item_id: string;
  name: string;
  provinceId?: string | number;
  description: string;
  allocated_amount: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreateBudgetItemDetailsDTO {
  budget_item_id: string | number;
  name: string;
  provinceId?: string | number;
  description: string;
  allocated_amount: string;
}
export interface UpdateBudgetItemDetailsDTO {
  id: string;
  // budget_item_id: string | number;
  name: string;
  provinceId?: string | number;
  description: string;
  allocated_amount: string;
}
