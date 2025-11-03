import type { RouteRecordRaw } from "vue-router";
import ProductListView from "../views/product/ProductListView.vue";

export const productRoutes: RouteRecordRaw[] = [
  {
    path: "/products",
    name: "product.index",
    component: ProductListView,
    meta: {
      Title: "products",
      requiredAuth: true,
    },
  },
];