export interface CreateProductDTO {
  name: string;
  description: string;
  product_type_id: number;
  unit_id?: string | null;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  product_type_id?: number;
  unit_id?: string | null;
  status?: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  product_type_id: number;
  unit_id: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}