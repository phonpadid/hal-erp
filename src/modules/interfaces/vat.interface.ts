export interface VatInterface {
  id: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface VatUpdate {
  id: string;
  amount?: number;
}
