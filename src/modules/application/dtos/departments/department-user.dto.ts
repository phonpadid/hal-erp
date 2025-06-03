import type { PositionDTO } from "../position.dto";
import type { CreateUserDTO, UserDTO } from "../user.dto";
import type { DepartmentDTO } from "./department.dto";

export interface CreateDepartmentUserDTO {
  user: CreateUserDTO | null;
  position_id: string | null;
  signature_file: string | File | null;
}

export interface UpdateDepartmentUserDTO {
  id: string;
  user: UpdateUserDTO;
  position_id: string;
  signature_file: string | File;
}

export interface DepartmentUserDTO {
  id: string;
  user_id: string;
  department_id: string;
  position_id: string;
  signature_file: string | File;
  department: DepartmentDTO | null,
  position: PositionDTO | null,
  user: UserDTO | null
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UpdateUserDTO {
  id: string;
  username: string;
  email: string;
  password: string;
  tel: string;
}
