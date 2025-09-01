import type { RouteRecordRaw } from "vue-router";
import PurchaseOrdersList from "../../../views/purchase_orders/PurchaseOrdersList.vue";
import PurchaseOrdersDetails from "../../../components/purchase/purchase_orders/PurchaseOrdersDetails.vue";
import DocTypeSelect from "../../../components/purchase/purchase_orders/DocTypeSelect.vue";
import DetailsOrderList from "../../../components/purchase/purchase_orders/DetailsOrderList.vue";

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
    path: "/doc-type-select",
    name: "doc-type-select",
    component: DocTypeSelect,
    meta: {
      title: "Document Type Select",
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
  {
    path: "/purchase-orders/details/:id",
    name: "purchaseOrdersDetails",
    component: DetailsOrderList,
    // props: { isEditMode: false },
    meta: {
      title: "Purchase Orders Details",
      requiredAuth: true,
    },
  },
];
