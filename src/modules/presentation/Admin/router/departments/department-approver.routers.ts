import type { RouteRecordRaw } from "vue-router";
import DepartmentApvView from "../../views/departments/department-approvers/DepartmentApvView.vue";

export const departmentApproverRoutes: RouteRecordRaw[] = [
  {
    path: "/department_approver",
    name: "department_approver.index",
    component: DepartmentApvView,
    meta: {
      title: "Department approver",
      requiredAuth: true,
    },
  },
];
