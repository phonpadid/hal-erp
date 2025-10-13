import type { RouteRecordRaw } from "vue-router";
import Role from "../views/role/Role.vue";
import RoleForm from "../components/role/RoleForm.vue";

export const rolesRoutes: RouteRecordRaw[] = [
  {
    path: "/roles",
    name: "roleList",
    component: Role,
    meta: {
      title: "Roles",
      requiredAuth: true,
    },
  },
  {
    path: "/roles/add",
    name: "roleCreate",
    component: RoleForm,
    meta: {
      title: "Create Role",
      requiredAuth: true,
    },
  },
  {
    path: "/roles/edit/:id",
    name: "roleEdit",
    component: RoleForm,
    meta: {
      title: "Edit Role",
      requiredAuth: true,
    },
  }
];
