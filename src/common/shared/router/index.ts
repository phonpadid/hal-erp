import { dashboardRoute } from "@/modules/presentation/Admin/dashboard/router";
import { unitRoutes } from "@/modules/presentation/Admin/router/unitRoutes";
import { categoryRoutes } from "@/modules/presentation/Admin/router/categoryRoutes";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: () => import("../layouts/BaseLayout.vue"),
    children: [...dashboardRoute, ...unitRoutes,...categoryRoutes],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
