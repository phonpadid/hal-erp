export interface BankInterface {
  id: number;
  name: string;
  short_name: string;
  logo?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface BankCreate {
  name: string;
  short_name: string;
  logo?: string | File | null;
}

export interface BankUpdate {
  id: number;
  name?: string;
  short_name?: string;
  logo?: string | File | null;
}
