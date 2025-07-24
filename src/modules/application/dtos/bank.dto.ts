export interface CreateBankDTO {
  name: string
  short_name: string
  logo?: string | null
}

export interface UpdateBankDTO {
  name?: string
  short_name?: string
  logo?: string | null
}

export interface BankDTO {
  id: string
  name: string
  short_name: string
  logo: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
