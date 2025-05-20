import { dashboardRoute } from "@/modules/presentation/Admin/dashboard/router";
<<<<<<< HEAD
import { permissionRoutes } from "@/modules/presentation/Admin/router/permissionRoutes";
import { rolesRoutes } from "@/modules/presentation/Admin/router/roleRoutes";
=======
import { departmentRoutes } from "@/modules/presentation/Admin/router/departments/department.routers";
>>>>>>> 8b79029224d2bcbfa6a783a1e912f18fb2248ec4
import { unitRoutes } from "@/modules/presentation/Admin/router/unitRoutes";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: () => import("../layouts/BaseLayout.vue"),
<<<<<<< HEAD
    children: [...dashboardRoute, ...unitRoutes, ...rolesRoutes, ...permissionRoutes],
=======
    children: [...dashboardRoute, ...unitRoutes, ...departmentRoutes],
>>>>>>> 8b79029224d2bcbfa6a783a1e912f18fb2248ec4
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
