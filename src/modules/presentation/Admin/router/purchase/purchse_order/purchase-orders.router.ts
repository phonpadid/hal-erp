import type { RouteRecordRaw } from "vue-router";
import PurchaseOrdersList from "../../../views/purchase_orders/PurchaseOrdersList.vue";
import PurchaseOrdersDetails from "../../../components/purchase/purchase_orders/PurchaseOrdersDetails.vue";

export const purchaseOrdersRoutes: RouteRecordRaw[] = [
  {
    path: "/purchase-orders",
    name: "purchaseOrdersList",
    component: PurchaseOrdersList,
    meta: {
      title: "Purchase Orders",
      requiredAuth: true,
    },
  },
  {
    path: "/purchase-orders/detail/:id",
    name: "purchaseOrdersDetail",
    component: PurchaseOrdersDetails,
    // props: { isEditMode: false },
    meta: {
      title: "Purchase Orders Details",
      requiredAuth: true,
    },
  },
];
