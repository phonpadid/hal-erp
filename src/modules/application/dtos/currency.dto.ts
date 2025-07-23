export interface CreateCurrencyDTO {
  name: string;
  code: string;
}

export interface UpdateCurrencyDTO {
  id: string;
  name: string;
  code: string;
}

export interface CurrencyDTO {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
