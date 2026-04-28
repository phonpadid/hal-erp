export interface VendorProductInterface {
  id: string;
  vendor_id: number;
  product_id: number;
  price: number;
  currency_id?: number | null;
  currency?: {
    id: string;
    code: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface VendorProductCreateInterface {
  vendor_id: number;
  product_id: number;
  price: number;
  currency_id?: number;
}

export interface VendorProductUpdateInterface {
  vendor_id?: number;
  product_id?: number;
  price?: number;
  currency_id?: number;
}

export interface VendorProductApiModel {
  id: string;
  vendor_id: number;
  product_id: number;
  price: number;
  currency_id?: number | null;
  currency?: {
    id: string;
    code: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}