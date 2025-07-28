export interface ProvinceInterface {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetItemDetailsInterface {
  id: string;
  budget_item_id: string | number;
  name: string;
  description?: string;
  allocated_amount: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  province?: ProvinceInterface;
  province_id: string | number;
}
export interface CreateBudgetItemDetailsInterface {
  budget_item_id: string | number;
  name: string;
  provinceId?: string | number;
  description?: string;
  allocated_amount?: string;
}
export interface UpdateBudgetItemDetailsInterface {
  id: string;
  // budget_item_id: string | number;
  name: string;
  province_id?: string | number;
  description?: string;
  allocated_amount?: string;
}
