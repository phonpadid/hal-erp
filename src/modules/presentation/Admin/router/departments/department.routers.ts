import type { RouteRecordRaw } from "vue-router";
import DepartmentView from "../../views/departments/departments/DepartmentView.vue";

export const departmentRoutes: RouteRecordRaw[] = [
  {
    path: "/department",
    name: "department.index",
    component: DepartmentView,
    meta: {
      title: "Department",
      requiredAuth: true,
    },
  },
];
