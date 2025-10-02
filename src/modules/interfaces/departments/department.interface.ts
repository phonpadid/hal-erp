export interface DepartmentApiModel {
  id: number;
  name: string;
  code?: string;
  department_head_id:number | string | null;
  created_at?: string;
  updated_at?: string;
}
