import { dashboardRoute } from "@/modules/presentation/Admin/dashboard/router";
import { permissionRoutes } from "@/modules/presentation/Admin/router/permissionRoutes";
import { rolesRoutes } from "@/modules/presentation/Admin/router/roleRoutes";
import { departmentRoutes } from "@/modules/presentation/Admin/router/departments/department.routers";
import { unitRoutes } from "@/modules/presentation/Admin/router/unitRoutes";
import { categoryRoutes } from "@/modules/presentation/Admin/router/categoryRoutes";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { positionRoutes } from "@/modules/presentation/Admin/router/positionRountes";
<<<<<<< HEAD
=======
import { userRoutes } from "@/modules/presentation/Admin/router/userRoutes";
import { departmentApproverRoutes } from "@/modules/presentation/Admin/router/departments/department-approver.routers";
import { departmentUserRoutes } from "@/modules/presentation/Admin/router/departments/department-user.routers";
import { documentTypesRoutes } from "@/modules/presentation/Admin/router/documentTypeRoutes";
>>>>>>> 4ecac6a119ac2b7fd3bbe4b6e8e3e2c99f9ca2d6

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
      ...documentTypesRoutes,
      ...categoryRoutes,
      ...positionRoutes,
    ],
>>>>>>> 4ecac6a119ac2b7fd3bbe4b6e8e3e2c99f9ca2d6
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
