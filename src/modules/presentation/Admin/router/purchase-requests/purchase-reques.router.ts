import type { RouteRecordRaw } from "vue-router";
import PurchaseRequestView from "../../views/purchase-requests/PurchaseRequestView.vue";
import PurchaseRequestDetail from "../../components/purchase-requests/PurchaseRequestDetail.vue";
import CreatePurchaseRq from "../../components/purchase-requests/CreatePurchaseRq.vue";

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
  {
    path: "/purchase-requests/:id",
    name: "purchase_request_detail",
    component: PurchaseRequestDetail,
    meta: {
      title: "Purchase requests",
      requiredAuth: true,
    },
  },
  {
    path: "/create-purchase-requests",
    name: "create_purchase_request",
    component: CreatePurchaseRq,
    meta: {
      title: "Creation purchase requests",
      requiredAuth: true,
    },
  },
];
