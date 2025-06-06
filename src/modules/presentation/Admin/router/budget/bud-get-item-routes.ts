import type { RouteRecordRaw } from "vue-router";
import BudGetItemList from "../../views/budget/budget_item/BudGetItemList.vue";

export const budgetItemRoutes: RouteRecordRaw[] = [
  {
    path: "/budget-items",
    name: "budget-items",
    component: BudGetItemList,
    meta: {
      title: "Budget Items",
      requiredAuth: true,
    },
  },
];
