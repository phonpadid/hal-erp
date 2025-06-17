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
import { authGuard } from "@/modules/presentation/Admin/router/guards/auth.guard";
import { currencyRoutes } from "@/modules/presentation/Admin/router/currencies.routers";
import { budgetApvRuleRoutes } from "@/modules/presentation/Admin/router/budget-apv-rule.routers";
import { authRoutes } from "@/modules/presentation/Admin/router/loginRoutes";
import { budgetAccountsRoutes } from "@/modules/presentation/Admin/router/budget/bud-get-account-routes";
import { budgetItemRoutes } from "@/modules/presentation/Admin/router/budget/bud-get-item-routes";

import { approvalWorkflowRoutes } from "@/modules/presentation/Admin/router/approval-workflow.routers";
import { budgetItemDetailsRoutes } from "@/modules/presentation/Admin/router/budget/bud-get-item-details-routes";
import { approvalWorkflowStepRoutes } from "@/modules/presentation/Admin/router/approval-workflow-step.routers";
import { purchaseRequestRoutes } from "@/modules/presentation/Admin/router/purchase-requests/purchase-reques.router";

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
      ...userApprovalRoutes,
      ...currencyRoutes,
      ...budgetApvRuleRoutes,

      ...budgetAccountsRoutes,
      ...budgetItemRoutes,
      ...approvalWorkflowRoutes,
      ...approvalWorkflowStepRoutes,
      ...budgetItemDetailsRoutes,
      ...purchaseRequestRoutes
    ],
  },
  ...authRoutes,

  // Not found route
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/modules/presentation/Admin/views/NotFoundPage.vue"),
    meta: {
      layout: "blank",
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});
// Add navigation guard
router.beforeEach(authGuard);

// Add title setting
router.afterEach((to) => {
  document.title = `${to.meta.title || "HAL ERP"} - HAL ERP System`;
});

export default router;
