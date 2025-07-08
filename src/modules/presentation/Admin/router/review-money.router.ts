import type { RouteRecordRaw } from "vue-router";
import ReviewMoneyView from "../views/review-money/views/ReviewMoneyView.vue";
export const reviewMoneyRoutes: RouteRecordRaw[] = [
  {
    path: "/review-money",
    name: "review-money-list",
    component: ReviewMoneyView,
    meta: {
      title: " Review Money List",
      requiredAuth: true,
    },
  },
];
