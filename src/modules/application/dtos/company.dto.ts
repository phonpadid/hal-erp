export interface CreateCompanyDTO {
  name: string;
  logo?: string | null;
  tel: string;
  email: string;
  address: string;
  user?: {
    username: string;
    email: string;
    tel: string;
    password: string;
    confirm_password: string;
    signature?: string | null;
  };
}

export interface UpdateCompanyDTO {
  name?: string;
  logo?: string | null;
  tel?: string;
  email?: string;
  address?: string;
}

export interface CompanyDTO {
  id: string;
  name: string;
  logo: string | null;
  tel: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}