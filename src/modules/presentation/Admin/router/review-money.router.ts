import type { RouteRecordRaw } from "vue-router";
import ReviewMoneyView from "../views/review-money/views/ReviewMoneyView.vue";
import FormSucess from "../components/receipt/FormSucess.vue";
import FormCreate from "../components/receipt/FormCreate.vue";
import FormDetails from "../components/receipt/FormDetails.vue";
export const reviewMoneyRoutes: RouteRecordRaw[] = [
  {
    path: "/receipts",
    name: "receipt.index",
    component: ReviewMoneyView,
    meta: {
      title: " Review Money List",
      requiredAuth: true,
    },
  },
  {
    path: "/receipt/create/receipt_id=:id/document_type=:docid",
    name: "create-receipt",
    component: FormCreate,
    meta: {
      title: "Create Receipt",
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
