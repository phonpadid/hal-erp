import { dashboardRoute } from "@/modules/presentation/Admin/dashboard/router";
import { permissionRoutes } from "@/modules/presentation/Admin/router/permissionRoutes";
import { rolesRoutes } from "@/modules/presentation/Admin/router/roleRoutes";
import { departmentRoutes } from "@/modules/presentation/Admin/router/departments/department.routers";
import { unitRoutes } from "@/modules/presentation/Admin/router/unitRoutes";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { userRoutes } from "@/modules/presentation/Admin/router/userRoutes";

const routes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: () => import("../layouts/BaseLayout.vue"),
    children: [
      ...dashboardRoute,
      ...unitRoutes,
      ...rolesRoutes,
      ...permissionRoutes,
      ...departmentRoutes,
      ...userRoutes,
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
