import type { RouteRecordRaw } from "vue-router";
import PurchaseRequestView from "../../views/purchase-requests/PurchaseRequestView.vue";

export const purchaseRequestRoutes: RouteRecordRaw[] = [
  {
    path: "/purchase-requests",
    name: "purchase_request.index",
    component: PurchaseRequestView,
    meta: {
      title: "Purchase requests",
      requiredAuth: true,
    },
  },
];
