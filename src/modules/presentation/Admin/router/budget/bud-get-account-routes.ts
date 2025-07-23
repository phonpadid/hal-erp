import type { RouteRecordRaw } from "vue-router";
import BudgetAccount from "../../views/budget/budget_account/BudgetAccount.vue";

export const budgetAccountsRoutes: RouteRecordRaw[] = [
  {
    path: "/budget-accounts",
    name: "budget-accounts",
    component: BudgetAccount,
    meta: {
      title: "Budget Accounts",
      requiredAuth: true,
    },
  },
];
