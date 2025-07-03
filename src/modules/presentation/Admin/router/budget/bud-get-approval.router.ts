import type { RouteRecordRaw } from "vue-router";
import BudgetApprovalList from "../../views/budget/budget-approval/BudgetApprovalList.vue";
import BudgetApprovalDetails from "../../components/budget-approval/BudgetApprovalDetails.vue";

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
  {
    path: "/budget-approval/detail/:id",
    name: "budget-approval-detail",

    component: BudgetApprovalDetails,
    meta: {
      title: "Budget Approval Detail",
      requiredAuth: true,
    },
  },
];
