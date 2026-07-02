export interface CompanyProductInterface {
  id: number;
  company_id: number;
  product_id: number;
  product_name?: string;
  company_name?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Assign supports an array of products (idempotent — already-linked products are skipped server-side)
export interface CompanyProductCreate {
  product_ids: number[];
  status?: string;
  company_id?: number; // admin/super-admin only; ignored for non-admins (auto-scoped)
}

export interface CompanyProductUpdate {
  id?: number;
  status?: string;
}
