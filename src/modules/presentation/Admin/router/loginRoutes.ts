// src/router/index.ts
import type { RouteRecordRaw } from "vue-router";

export const authRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/modules/presentation/Admin/views/authentication/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: () =>
      import("@/modules/presentation/Admin/views/authentication/ResetPassword.vue"),
    meta: { requiresAuth: false, layout: "blank", title: "Reset password" },
  },
];

