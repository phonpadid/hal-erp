export interface CreateDepartmentUserDTO {
  user_id: string | null;
  department_id: string | null;
  position_id: string | null;
  signature_file: string | File | null;
}

export interface UpdateDepartmentUserDTO {
  id: string;
  user_id: string;
  department_id: string;
  position_id: string;
  signature_file: string | File;
}

export interface DepartmentUserDTO {
  id: string;
  user_id: string;
  department_id: string;
  position_id: string;
  signature_file: string | File;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
