export interface ProductTypeInterface {
  id: number;
  name: string;
  category_id: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProductTypeCreate {
  name: string;
  category_id?: number | null;
}

export interface ProductTypeUpdate {
  id: number;
  name?: string;
  category_id?: number | null;
}

export interface ProductTypeApiModel {
  id: number;
  name: string;
  category_id: number | null;
  created_at: string;
  updated_at: string;
}