import type { RouteRecordRaw } from "vue-router";
import PurchaseRequestView from "../../views/purchase-requests/PurchaseRequestView.vue";
import PurchaseRequestDetail from "../../components/purchase-requests/PurchaseRequestDetail.vue";
import CreatePurchaseRq from "../../components/purchase-requests/CreatePurchaseRq.vue";
import ApprovalPuchaseRq from "../../components/purchase-requests/approval-purchase-requests/ApprovalPuchaseRq.vue";
import ApprovalPuchaseRqDetail from "../../components/purchase-requests/approval-purchase-requests/ApprovalPuchaseRqDetail.vue";
import UpdatePurchaseRequest from "../../components/purchase-requests/UpdatePurchaseRequest.vue";

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
    name: "purchase_request_edit",
    component: UpdatePurchaseRequest,
    meta: {
      title: "Purchase Edit",
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

  //approval purchase requests
  {
    path: "/approval-purchase-requests",
    name: "apv_purchase_request.index",
    component: ApprovalPuchaseRq,
    meta: {
      title: "Creation purchase requests",
      requiredAuth: true,
    },
  },
  {
    path: "/apv-purchase-requests/:id",
    name: "apv_purchase_request_detail",
    component: ApprovalPuchaseRqDetail,
    meta: {
      title: "Purchase requests",
      requiredAuth: true,
    },
  },
];
