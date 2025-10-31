export interface CreateProductTypeDTO {
  name: string;
  category_id: number | null;
}

export interface UpdateProductTypeDTO {
  name?: string;
  category_id?: number | null;
}

export interface ProductTypeDTO {
  id: string;
  name: string;
  category_id: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}