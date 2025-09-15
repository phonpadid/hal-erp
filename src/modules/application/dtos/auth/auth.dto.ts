// src/modules/application/dtos/auth/auth.dto.ts
export interface LoginDTO {
  username: string;
  password: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  tel: string;
  roles: string[];
  permission: string[];
  user_type: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AuthResponseDTO {
  status_code: number;
  message: string;
  data: {
    access_token: string;
    user: UserDTO;
  };
}
