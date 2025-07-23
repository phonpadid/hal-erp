import type { RouteRecordRaw } from "vue-router";
import BudgetApvRuleView from "../views/budget-approval-rules/BudgetApvRuleView.vue";

export const budgetApvRuleRoutes: RouteRecordRaw[] = [
  {
    path: "/budget-approval-rule",
    name: "budget_apv_rule.index",
    component: BudgetApvRuleView,
    meta: {
      title: "Department",
      requiredAuth: true,
    },
  },
];
