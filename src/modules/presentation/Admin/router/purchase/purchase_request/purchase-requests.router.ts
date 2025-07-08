import type { RouteRecordRaw } from "vue-router";
import PurchaseRequestsList from "../../../views/purchase_requests/PurchaseRequestsList.vue";
import PurchaseRequestDetails from "../../../components/purchase/purchase_requests/PurchaseRequestDetails.vue";

export const purchaseRequestsRoutes: RouteRecordRaw[] = [
  {
    path: "/purchase-requests-list",
    name: "purchaseRequestsList",
    component: PurchaseRequestsList,
    meta: {
      title: "Purchase Requests",
      requiredAuth: true,
    },
  },
  {
    path: "/purchase-requests-list/detail/:id",
    name: "purchaseRequestsDetail",
    component: PurchaseRequestDetails,
    props: { isEditMode: false },
    meta: {
      title: "Purchase Request Details",
      requiredAuth: true,
    },
  },
];
