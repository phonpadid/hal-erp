import type { RouteRecordRaw } from "vue-router";
import DepartmentUserView from "../../views/departments/deparment-user/DepartmentUserView.vue";
import DepartmentUser from "../../components/departments/department-user/DepartmentUser.vue";

export const departmentUserRoutes: RouteRecordRaw[] = [
  {
    path: "/department-user",
    name: "department_user.index",
    component: DepartmentUserView,
    meta: {
      title: "Department user",
      requiredAuth: true,
    },
  },
  {
    path: "/add/department-user",
    name: "add_department_user.index",
    component: DepartmentUser,
    meta: {
      title: "Department user",
      requiredAuth: true,
    },
  },
  {
    path: "/edit/department-user/:id",
    name: "edit_department_user.index",
    component: DepartmentUser,
    meta: {
      title: "Department user",
      requiredAuth: true,
    },
  },
];
