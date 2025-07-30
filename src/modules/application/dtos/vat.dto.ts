export interface UpdateVatDTO {
  amount: number;
}

export interface VatDTO {
  id: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
