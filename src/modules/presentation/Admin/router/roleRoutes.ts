import type { RouteRecordRaw } from "vue-router";
import RoleView from "../views/role/RoleView.vue";

export const rolesRoutes: RouteRecordRaw[] = [
  {
    path: "/roles",
    name: "roleList",
    component: RoleView,
    meta: {
      title: "Roles",
      requiredAuth: true,
    },
  }
];
