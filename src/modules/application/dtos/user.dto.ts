export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  tel: string;
}

export interface UpdateUserDTO {
  name: string;
  username: string;
  email: string;
  password: string;
  tel: string;
}

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  password: string;
  tel: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
