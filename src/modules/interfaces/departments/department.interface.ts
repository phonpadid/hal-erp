export interface DepartmentApiModel {
  id: number;
  name: string;
  code?: string;
  department_head_id:number | string | null;
  type: 'in_the_office' | 'outside_the_office';
  created_at?: string;
  updated_at?: string;
}
