import type { UserInterface } from "@/modules/interfaces/user.interface";
import type { BudgetAccountDTO } from "../budget-accounts.dto";
import type { IncreaseBudgetAccountDetailCreateDTO, IncreaseDetailDTO } from "./increase-detail.dto";
import type { IncreaseBudgetFileDto } from "./increase-budget-file.dto";

export interface IncreaseBudgetAccountDTO {
  id: number;
  budget_account_id: number;
  allocated_amount: number;
  description: string;
  // import_date: string;
  file_name: string;
  user_id: number | null;
  created_at: string;

  budget_account: BudgetAccountDTO;
  created_by_user: UserInterface;
  increase_budget_files: IncreaseBudgetFileDto[];
  increase_budget_details: IncreaseDetailDTO[];

  updated_at?: string ;
  deleted_at?: string | null;
}


export interface IncreaseBudgetAccountCreateDTO {
  id?: number;
  budget_account_id: number;
  description: string;
  // import_date: string;
  file_name: string;
  user_id?: number | null;
  increase_budget_details?: IncreaseBudgetAccountDetailCreateDTO[];
}

export interface IncreaseBudgetAccountUpdateDTO {
  id: number | null;
  budget_account_id: number;
  description: string;
  file_name: string;
}




