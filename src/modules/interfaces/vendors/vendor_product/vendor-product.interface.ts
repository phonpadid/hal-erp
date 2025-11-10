export interface VendorProductInterface {
  id: string;
  vendor_id: string;
  product_id: string;
  price: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface VendorProductCreateInterface {
  vendor_id: string;
  product_id: string;
  price: number;
}

export interface VendorProductUpdateInterface {
  vendor_id?: string;
  product_id?: string;
  price?: number;
}

export interface VendorProductApiModel {
  id: string;
  vendor_id: string;
  product_id: string;
  price: number;
  created_at: string;
  updated_at: string;
}