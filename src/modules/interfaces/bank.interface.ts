export interface BankApiModel {
  id: string;
  name: string;
  short_name: string;
  logo: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: Date | null;
}
