import type { RouteRecordRaw } from "vue-router";
import BudGetItemDetailsList from "../../views/budget/budget_item_details/BudgetItemDetailsList.vue";

export const budgetItemDetailsRoutes: RouteRecordRaw[] = [
  {
    path: "/budget-items-details",
    name: "budget-items-details",
    component: BudGetItemDetailsList,
    meta: {
      title: "Budget Items Details",
      requiredAuth: true,
    },
  },
];
