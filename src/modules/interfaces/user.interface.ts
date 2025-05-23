export interface UserInterface {
  id: number;
  username: string;
  email: string;
  password?: string;
  tel?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface UserCreatePayload {
  username: string;
  email: string;
  password: string;
  tel?: string;
}

export interface UserUpdatePayload {
  username?: string;
  email?: string;
  password?: string;
  tel?: string;
}
