export interface VendorProductApiModel {
  id: string;
  vendor_id: string;
  product_id: number;
  product_name?: string;
  vendor_name?: string;
  price?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  vendor?: {
    id: string;
    name: string;
  };
  product?: {
    id: number;
    name: string;
  };
}

export interface CreateVendorProductApiRequest {
  vendor_id: number;
  product_id: number;
  product_name?: string;
}

export interface UpdateVendorProductApiRequest {
  vendor_id?: number;
  product_id?: number;
  product_name?: string;
}