export interface CreateCompanyProductDTO {
  product_ids: number[];
  status?: string;
  company_id?: number;
}

export interface UpdateCompanyProductDTO {
  status?: string;
}

export interface CompanyProductDTO {
  id: string;
  company_id: string;
  product_id: string;
  product_name: string;
  company_name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
