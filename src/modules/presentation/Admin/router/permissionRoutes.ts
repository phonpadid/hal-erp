import type { RouteRecordRaw } from "vue-router";
import Permission from "../views/permission/Permission.vue";

export const permissionRoutes: RouteRecordRaw[] = [
  {
    path: "/permissions",
    name: "permissionsList",
    component: Permission,
    meta: {
      title: "Permissions",
      requiredAuth: true,
    },
  },
];
