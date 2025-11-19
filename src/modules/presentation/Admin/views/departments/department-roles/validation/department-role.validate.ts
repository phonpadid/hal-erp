import type { CreateDepartmentRoleDTO, UpdateDepartmentRoleDTO } from "@/modules/application/dtos/departments/department-role.dto";

export interface DepartmentRoleValidation {
  role_id?: string;
  department_id?: string;
  permissions?: string;
}

export const validateDepartmentRole = (data: CreateDepartmentRoleDTO | UpdateDepartmentRoleDTO): DepartmentRoleValidation => {
  const errors: DepartmentRoleValidation = {};

  if (!data.role_id || data.role_id <= 0) {
    errors.role_id = "Role is required";
  }

  if (!data.department_id || data.department_id <= 0) {
    errors.department_id = "Department is required";
  }

  if (!data.permissions || !Array.isArray(data.permissions) || data.permissions.length === 0) {
    errors.permissions = "At least one permission is required";
  }

  return errors;
};

export const hasValidationErrors = (errors: DepartmentRoleValidation): boolean => {
  return Object.keys(errors).length > 0;
};