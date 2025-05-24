export interface DepartmentUserApiModel {
  id: number;
  user_id: string;
  position_id?: string;
  department_id?: string;
  signature_file?: string | File;

  username?: string;
  positionName?: string;
  departmentName?: string;
  created_at?: string;
  updated_at?: string;
}
