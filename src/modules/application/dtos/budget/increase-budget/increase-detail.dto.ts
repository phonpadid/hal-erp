import type { BudgetAccountDTO } from "../budget-accounts.dto";

export interface IncreaseDetailDTO {
  id: string;
  increase_budget_id: number | null;
  budget_item_id: number;
  allocated_amount: number;
  budget_item?: ItemDto | null;
  budget_account?: BudgetAccountDTO | null;


  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface ItemDto {
  id: number;
  increase_budget_id?: number | null;
  budget_item_id?: number; // Uncomment if needed
  name?: string;
  butget_account_id?: number;
  allocated_amount?: number;
  use_amount?: number;
  balance_amount?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
  budget_account?: BudgetAccountDTO | null;
}
export interface IncreaseBudgetAccountDetailCreateDTO {
  id?: number;
  // increase_budget_id?: number | null;
  budget_item_id: number;
  allocated_amount: number;
}

export interface IncreaseBudgetAccountDetailUpdateDTO {
  id?: number;
  // increase_budget_id?: number | null;
  budget_item_id: number;
  allocated_amount: number;
}
