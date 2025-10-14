export interface CreateDepartmentDTO {
  name: string;
  code: string;
  type: 'in_the_office' | 'outside_the_office';
  
}

export interface UpdateDepartmentDTO {
  id: string;
  name: string;
  code: string;
  department_head_id:string | number | null
  type: 'in_the_office' | 'outside_the_office';
}

export interface DepartmentDTO {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
