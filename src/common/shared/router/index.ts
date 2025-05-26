import { dashboardRoute } from "@/modules/presentation/Admin/dashboard/router";
import { permissionRoutes } from "@/modules/presentation/Admin/router/permissionRoutes";
import { rolesRoutes } from "@/modules/presentation/Admin/router/roleRoutes";
import { departmentRoutes } from "@/modules/presentation/Admin/router/departments/department.routers";
import { unitRoutes } from "@/modules/presentation/Admin/router/unitRoutes";
import { categoryRoutes } from "@/modules/presentation/Admin/router/categoryRoutes";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
<<<<<<< HEAD
import { positionRoutes } from "@/modules/presentation/Admin/router/positionRountes";
=======
import { userRoutes } from "@/modules/presentation/Admin/router/userRoutes";
import { departmentApproverRoutes } from "@/modules/presentation/Admin/router/departments/department-approver.routers";
import { departmentUserRoutes } from "@/modules/presentation/Admin/router/departments/department-user.routers";
>>>>>>> d0fd1f9a49f4086a3cb14469e700661be7545c03

const routes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: () => import("../layouts/BaseLayout.vue"),
<<<<<<< HEAD
    children: [...dashboardRoute, ...unitRoutes,...categoryRoutes,...positionRoutes,...departmentRoutes,...permissionRoutes,...rolesRoutes],
=======
    children: [
      ...dashboardRoute,
      ...unitRoutes,
      ...rolesRoutes,
      ...permissionRoutes,
      ...departmentRoutes,
      ...userRoutes,
      ...departmentApproverRoutes,
      ...departmentUserRoutes,
    ],
>>>>>>> d0fd1f9a49f4086a3cb14469e700661be7545c03
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
