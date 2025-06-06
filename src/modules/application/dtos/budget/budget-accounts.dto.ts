export interface BudgetAccountDTO {
  id: string;
<<<<<<< HEAD
  name: string;
  fiscal_year: string;
  allocated_amount: string;
  departmentId: string;
=======
  code: string;
  name: string;
  fiscal_year: string;
  allocated_amount: string;
  department_id: string;
>>>>>>> 4ced7fa30bcd864e4e7a5d88e9fd0abb6221f397
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreateBudgetAccountDTO {
<<<<<<< HEAD
  name: string;
  fiscal_year: string | number;
  allocated_amount: string | number;
  departmentId: string | number;
}
export interface UpdateBudgetAccountDTO {
  id: string | number;
  name: string;
  fiscal_year: string | number;
  allocated_amount: string | number;
  department_id: string | number;
=======
  code: string;
  name: string;
  fiscal_year: string;
  allocated_amount: string;
  department_id: string;
}
export interface UpdateBudgetAccountDTO {
  id: string;
  code: string;
  name: string;
  fiscal_year: string;
  allocated_amount: string;
  department_id: string;
>>>>>>> 4ced7fa30bcd864e4e7a5d88e9fd0abb6221f397
}
