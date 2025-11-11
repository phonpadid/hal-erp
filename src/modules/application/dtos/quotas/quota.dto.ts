export interface CreateQuotaDTO {
  company_id: number;
  vendor_id: number;
  product_id: number;
  qty: number;
  year: string;
}

export interface UpdateQuotaDTO {
  id: string;
  company_id: number;
  vendor_id: number;
  product_id: number;
  qty: number;
  year: string;
}

export interface QuotaResponseDTO {
  id: string;
  company_id: number;
  vendor_id: number;
  product_id: number;
  qty: number;
  year: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface GetQuotasDTO {
  page?: number;
  limit?: number;
  search?: string;
  company_id?: number;
  vendor_id?: number;
  product_id?: number;
  year?: string;
}