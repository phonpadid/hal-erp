import type { RouteRecordRaw } from "vue-router";

export const dashboardRoute: RouteRecordRaw[] = [
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("../views/DashBoard.vue"),
    meta: {
      label: "ໜ້າຫຼັກ",
    },
  },
];
