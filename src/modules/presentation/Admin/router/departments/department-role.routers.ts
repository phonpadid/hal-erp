import type { RouteRecordRaw } from "vue-router";
import DepartmentRoleView from "../../views/departments/department-roles/DepartmentRoleView.vue";
import DepartmentRoleForm from "../../components/departments/department-role/DepartmentRoleForm.vue";

export const departmentRoleRoutes: RouteRecordRaw[] = [
  {
    path: "/department-role",
    name: "department_role.index",
    component: DepartmentRoleView,
    meta: {
      title: "Department Role Management",
      requiredAuth: true,
      // permission: "read-department-role",
    },
  },
  {
    path: "/department-role/create",
    name: "department_role.create",
    component: DepartmentRoleForm,
    meta: {
      title: "Create Department Role",
      requiredAuth: true,
      // permission: "create-department-role",
    },
  },
  {
    path: "/department-role/edit/:id",
    name: "department_role.edit",
    component: DepartmentRoleForm,
    meta: {
      title: "Edit Department Role",
      requiredAuth: true,
      // permission: "update-department-role",
    },
  },
];
