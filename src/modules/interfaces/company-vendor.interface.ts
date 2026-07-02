export interface CompanyVendorInterface {
  id: number;
  company_id: number;
  vendor_id: number;
  vendor_name?: string;
  company_name?: string;
  status: string;
  credit_term_days: number;
  credit_limit: number;
  payment_term: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Assign one vendor at a time — credit terms differ per vendor, so no array assign.
export interface CompanyVendorCreate {
  vendor_id: number;
  status?: string;
  credit_term_days?: number;
  credit_limit?: number;
  payment_term?: string | null;
  company_id?: number; // admin/super-admin only; ignored for non-admins (auto-scoped)
}

export interface CompanyVendorUpdate {
  id?: number;
  status?: string;
  credit_term_days?: number;
  credit_limit?: number;
  payment_term?: string | null;
}
