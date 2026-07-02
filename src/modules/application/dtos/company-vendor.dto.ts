export interface CreateCompanyVendorDTO {
  vendor_id: number;
  status?: string;
  credit_term_days?: number;
  credit_limit?: number;
  payment_term?: string | null;
  company_id?: number;
}

export interface UpdateCompanyVendorDTO {
  status?: string;
  credit_term_days?: number;
  credit_limit?: number;
  payment_term?: string | null;
}

export interface CompanyVendorDTO {
  id: string;
  company_id: string;
  vendor_id: string;
  vendor_name: string;
  company_name: string;
  status: string;
  credit_term_days: number;
  credit_limit: number;
  payment_term: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
