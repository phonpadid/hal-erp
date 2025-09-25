import type { RouteRecordRaw } from "vue-router";
import BudgetAccount from "../../views/budget/budget_account/BudgetAccount.vue";
import BudGetItemList from "../../views/budget/budget_item/BudGetItemList.vue";
import { increaseBudgetRoutes } from "./increase-budget/increase-budget.router";

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
  {
    path: "/budget-accounts/item/:id",
    name: "budget-accounts-id-add",
    component: BudGetItemList,
   props: route => ({ budgetAccountId: route.params.id }),
    meta: {
      title: "Budget Accounts",
      requiredAuth: true,
    },
  },
  ...increaseBudgetRoutes,
];
