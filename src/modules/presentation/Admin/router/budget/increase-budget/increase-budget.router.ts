import type { RouteRecordRaw } from "vue-router";
import IncreaseBudgetView from "../../../views/budget/increase-budget/IncreaseBudgetView.vue";
import FormIncreaseBudget from "../../../components/budget/increase/FormIncreaseBudget.vue";
import IncreaseBudgetItemView from "../../../views/budget/increase-budget/IncreaseBudgetItemView.vue";

export const increaseBudgetRoutes: RouteRecordRaw[] = [
  {
    path: "/increase-budget",
    name: "increase_budget",
    component: IncreaseBudgetView,
    meta: {
      title: "Increase Budget",
      requiredAuth: true,
    },
  },
  {
    path: "/create-increase-budget",
    name: "form_increase_budget",
    component: FormIncreaseBudget,
    meta: {
      title: "Increase Budget",
      requiredAuth: true,
    },
  },
  {
    path: "/increase-budget-item/:id",
    name: "increase_budget_item",
    component: IncreaseBudgetItemView,
    meta: {
      title: "Increase Budget Item",
      requiredAuth: true,
    },
  }
];
