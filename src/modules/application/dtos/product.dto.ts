export interface CreateProductDTO {
  name: string;
  description: string;
  product_type_id: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  product_type_id?: number;
  status?: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  product_type_id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}