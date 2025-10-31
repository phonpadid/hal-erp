import type { RouteRecordRaw } from "vue-router";
import ProductTypeListView from "../views/product-type/ProductTypeListView.vue";

export const productTypeRoutes: RouteRecordRaw[] = [
  {
    path: "/product-types",
    name: "product-type.index",
    component: ProductTypeListView,
    meta: {
      Title: "product-types",
      requiredAuth: true,
    },
  },
];