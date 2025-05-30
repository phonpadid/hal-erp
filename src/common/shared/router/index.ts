import { dashboardRoute } from "@/modules/presentation/Admin/dashboard/router";
import { permissionRoutes } from "@/modules/presentation/Admin/router/permissionRoutes";
import { rolesRoutes } from "@/modules/presentation/Admin/router/roleRoutes";
import { departmentRoutes } from "@/modules/presentation/Admin/router/departments/department.routers";
import { unitRoutes } from "@/modules/presentation/Admin/router/unitRoutes";
import { categoryRoutes } from "@/modules/presentation/Admin/router/categoryRoutes";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { positionRoutes } from "@/modules/presentation/Admin/router/positionRountes";
import { userRoutes } from "@/modules/presentation/Admin/router/userRoutes";
import { departmentApproverRoutes } from "@/modules/presentation/Admin/router/departments/department-approver.routers";
import { departmentUserRoutes } from "@/modules/presentation/Admin/router/departments/department-user.routers";
import { userApprovalRoutes } from "@/modules/presentation/Admin/router/user-approval";
import { documentTypesRoutes } from "@/modules/presentation/Admin/router/documentTypeRoutes";
import { vendorsRoutes } from "@/modules/presentation/Admin/router/vendors/vendorRoutes";
import { vendorsBanksRoutes } from "@/modules/presentation/Admin/router/vendors/vendorBankAccountRoutes";

import { currencyRoutes } from "@/modules/presentation/Admin/router/currencies.routers";
import { budgetApvRuleRoutes } from "@/modules/presentation/Admin/router/budget-apv-rule.routers";

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
      ...departmentApproverRoutes,
      ...departmentUserRoutes,
      ...documentTypesRoutes,
      ...categoryRoutes,
      ...positionRoutes,
      ...userApprovalRoutes,
      ...vendorsRoutes,
      ...vendorsBanksRoutes,
      ... userApprovalRoutes,
      ...currencyRoutes,
      ...budgetApvRuleRoutes

    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
