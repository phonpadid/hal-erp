export interface CreateDepartmentDTO {
  name: string;
  code: string;
  
}

export interface UpdateDepartmentDTO {
  id: string;
  name: string;
  code: string;
  department_head_id:string | number | null
}

export interface DepartmentDTO {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
