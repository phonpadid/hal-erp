export interface CategoryInterface {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CategoryCreate {
  name: string;
}

export interface CategoryUpdate {
  id: number;
  name?: string;
}

export interface CategoryApiModel {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
