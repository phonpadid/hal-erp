export interface PositionInterface {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PositionCreate {
  name: string;
}

export interface PositionUpdate {
  id: number;
  name?: string;
}

export interface PositionApiModel {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
