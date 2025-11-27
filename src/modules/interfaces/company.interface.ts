export interface CompanyInterface {
  id: number;
  name: string;
  logo: string | null;
  logo_url?: string;
  tel: string;
  email: string;
  address: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CompanyCreate {
  name: string;
  logo: string | null;
  tel: string;
  email: string;
  address: string;
  user?: {
    username: string;
    email: string;
    tel: string;
    password: string;
    confirm_password: string;
    signature: string | null;
  };
}

export interface CompanyUpdate {
  id: number;
  name?: string;
  logo?: string | null;
  tel?: string;
  email?: string;
  address?: string;
}

export interface CompanyApiModel {
  id: number;
  name: string;
  logo: string | null;
  tel: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
}