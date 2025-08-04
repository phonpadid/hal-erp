import type { BudgetItemDetailForInterfaceType } from "@/modules/interfaces/budget/budget-item.interface";

export interface BudgetItemtDTO {
  id: string;
  budget_account_id: string;
  name: string;
  allocated_amount: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  budget_item_details?: BudgetItemDetailForInterfaceType[]; // เพิ่มฟิลด์นี้
}
export interface CreateBudgetItemDTO {
  budget_accountId: number;
  name: string;
  allocated_amount: number;
  description: string;
  // budget_item_details: Array<{
  //   name: string;
  //   provinceId: number;
  //   allocated_amount: number;
  //   description: string;
  // }>;
}
export interface UpdateBudgetItemDTO {
  id: string;
  budget_accountId: number;
  name: string;
  // budget_item_details: Array<{
  //   name: string;
  //   provinceId: number;
  //   allocated_amount: number;
  //   description: string;
  // }>;
}
