import type { RouteRecordRaw } from "vue-router";
import BudGetItemList from "../../views/budget/budget_item/BudGetItemList.vue";
import BudgetItemDetailsList from "../../views/budget/budget_item_details/BudgetItemDetailsList.vue";
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
  {
    path: "/budget-items/details/:id",
    name: "budget_items_details",
    component: BudgetItemDetailsList,
    meta: {
      title: "Budget Items Details",
      requiredAuth: true,
    },
  },
];
