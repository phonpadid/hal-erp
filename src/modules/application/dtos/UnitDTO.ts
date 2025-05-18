export interface CreateUnitDTO {
  name: string;
}

export interface UpdateUnitDTO {
  name: string;
}

export interface UnitDTO {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
