export interface CreateProductTypeDTO {
  name: string;
  categoryId?: string | null;
}

export interface UpdateProductTypeDTO {
  name?: string;
  categoryId?: string | null;
}

export interface ProductTypeDTO {
  id: string;
  name: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}