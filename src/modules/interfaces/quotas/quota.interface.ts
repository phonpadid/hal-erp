export interface QuotaApiModel {
  id: number;
  company_id: number;
  vendor_id: number;
  product_id: number;
  qty: number;
  year: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}