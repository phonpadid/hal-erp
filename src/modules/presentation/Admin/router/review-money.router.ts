import type { RouteRecordRaw } from "vue-router";
import ReviewMoneyView from "../views/review-money/views/ReviewMoneyView.vue";
import FormDetails from "../components/review-money/FormDetails.vue";
import FormCreate from "../components/review-money/FormCreate.vue";
import FormSucess from "../components/review-money/FormSucess.vue";
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
  {
    path: "/review-money/success",
    name: "review-money-success",
    component: FormSucess,
    meta: {
      title: " Review Money Success",
      requiredAuth: true,
    },
  },
  {
    path: "/review-money/create",
    name: "review-money-create",
    component: FormCreate,
    meta: {
      title: " Review Money List",
      requiredAuth: true,
    },
  },
  {
    path: "/review-money/details/:id",
    name: "review-money-details",
    component: FormDetails,
    meta: {
      title: " Review Money Details",
      requiredAuth: true,
    },
  },
];
