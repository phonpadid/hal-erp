export interface CreateCategoryDTO {
  name: string;
}

export interface UpdateCategoryDTO {
  name: string;
}
export interface CategoryDTO {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
