import type { BudgetAccountInterface } from "./budget-account.interface";

export interface BudgetItemDetailForInterfaceType {
  id: string | number;
  name: string;
  budget_item_id: string | number;
  province_id: string | number;
  description?: string;
  allocated_amount: string | number;
  created_at?: string;
  updated_at?: string;
  province?: {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface BudgetItemInterface {
  id: string;
  budget_account_id: string;
  name: string;
  allocated_amount: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  budget_account?: BudgetAccountInterface;
}

export interface CreateBudgetItemInterface {
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

export interface UpdateBudgetItemInterface {
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
