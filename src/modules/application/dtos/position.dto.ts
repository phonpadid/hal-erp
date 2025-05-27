export interface CreatePositionDTO {
  name: string;
}

export interface UpdatePositionDTO {
  name: string;
}
export interface PositionDTO {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
