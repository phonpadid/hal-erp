export interface QuotaApiModel {
  id: number;
  vendor_product_id: number;
  company_id?: number; // Still needed for purchase request integration
  qty: number;
  year: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  // Additional fields from API response
  vendor_id?: number;
  product_id?: number;

  // Nested objects from API response
  vendor_product?: {
    id: string;
    vendor_id: string;
    product_id: number;
    vendor?: {
      id: string;
      name: string;
    };
    product?: {
      id: number;
      name: string;
    };
    price: string;
    created_at: string;
    updated_at: string;
  };

  product?: {
    id: number;
    name: string;
    description?: string;
    product_type_id?: number;
    product_type?: {
      id: number;
      name: string;
    };
    unit_id?: number;
    unit?: {
      id: string;
      name: string;
    };
    status?: string;
    created_at: string;
    updated_at: string;
  };

  // Product object from API (uppercase P) - contains full product details with product_type and unit
  Product?: {
    id: number;
    name: string;
    description?: string;
    product_type_id?: number;
    product_type?: {
      id: number;
      name: string;
    };
    unit_id?: string;
    unit?: {
      id: string;
      name: string;
    };
    status?: string;
    created_at: string;
    updated_at: string;
  };

  vendor?: {
    id: number;
    name: string;
    contact_info?: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateQuotaApiRequest {
  qty: number;
  vendor_product_id: number;
  year: string;
}

export interface UpdateQuotaApiRequest {
  qty?: number;
  vendor_product_id?: number;
  year?: string;
}