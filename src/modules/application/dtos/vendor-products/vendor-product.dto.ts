export interface CreateVendorProductDTO {
  vendor_id: number;
  product_id: number;
  product_name?: string;
  price: number;
  currency_id?: number;
}

export interface UpdateVendorProductDTO {
  // id: string;
  vendor_id?: number;
  product_id?: number;
  product_name?: string;
  price?: number;
  currency_id?: number;
}

export interface VendorProductResponseDTO {
  id: string;
  vendor_id: number;
  product_id: number;
  product_name?: string;
  vendor_name?: string;
  price: number;
  currency_id?: number;
  currency?: {
    id: number;
    code: string;
    name: string;
  };
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface GetVendorProductsDTO {
  page?: number;
  limit?: number;
  search?: string;
  vendor_id?: number;
  product_id?: number;
  year?: string;
}