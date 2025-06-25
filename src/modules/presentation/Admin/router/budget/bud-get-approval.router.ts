import type { RouteRecordRaw } from "vue-router";
import BudgetApprovalList from "../../views/budget/budget-approval/BudgetApprovalList.vue";

export const budgetApprovalRoutes: RouteRecordRaw[] = [
  {
    path: "/budget-approval",
    name: "budget-approval",
    component: BudgetApprovalList,
    meta: {
      title: "Budget Approval",
      requiredAuth: true,
    },
  },
];
