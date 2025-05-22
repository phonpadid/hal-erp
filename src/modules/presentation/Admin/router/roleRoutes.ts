import type { RouteRecordRaw } from "vue-router";
import Role from "../views/role/Role.vue";

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
];
