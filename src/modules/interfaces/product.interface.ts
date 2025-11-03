export interface ProductInterface {
  id: number;
  name: string;
  description: string;
  product_type_id: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProductCreate {
  name: string;
  description: string;
  product_type_id: number;
}

export interface ProductUpdate {
  id: number;
  name?: string;
  description?: string;
  product_type_id?: number;
  status?: string;
}

export interface ProductApiModel {
  id: number;
  name: string;
  description: string;
  product_type_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}