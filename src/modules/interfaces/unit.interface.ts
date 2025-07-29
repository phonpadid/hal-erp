export interface UnitInterface {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface UnitCreate {
  name: string;
}

export interface UnitUpdate {
  id: number;
  name?: string;
}
export interface UnitApiModel {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

