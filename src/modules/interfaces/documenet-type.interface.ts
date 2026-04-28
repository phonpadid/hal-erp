export interface DoucmentTypeInterface {
  id: number;
  name: string;
  code: string;
  categoryId?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface DocumentTypeCreate {
  name: string;
  code: string;
  categoryId?: number;
}

export interface DocumentTypeUpdate {
  id: number;
  name?: string;
  code?: string;
  categoryId?: number;
}
