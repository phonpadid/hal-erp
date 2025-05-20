import { dashboardRoute } from "@/modules/presentation/Admin/dashboard/router";
import { departmentRoutes } from "@/modules/presentation/Admin/router/departments/department.routers";
import { unitRoutes } from "@/modules/presentation/Admin/router/unitRoutes";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: () => import("../layouts/BaseLayout.vue"),
    children: [...dashboardRoute, ...unitRoutes, ...departmentRoutes],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
