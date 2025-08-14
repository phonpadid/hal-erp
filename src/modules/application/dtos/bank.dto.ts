export interface CreateBankDTO {
  name: string;
  short_name: string;
  logo?: string | File | null;
}

export interface UpdateBankDTO {
  id: number;
  name?: string;
  short_name?: string;
  logo?: string | File | null;
}

export interface BankDTO {
  id: string;
  name: string;
  short_name: string;
  logo: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
