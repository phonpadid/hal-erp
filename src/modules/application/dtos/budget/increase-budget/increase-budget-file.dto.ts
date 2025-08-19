export interface IncreaseBudgetFileDto {
  id: string;
  increase_budget_id: number | null;
  file_name: string;
  file_name_url: string;

  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}
