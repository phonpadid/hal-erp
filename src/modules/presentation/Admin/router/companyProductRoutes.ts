import type { RouteRecordRaw } from "vue-router";
import CompanyProductListView from "../views/company-product/CompanyProductListView.vue";

export const companyProductRoutes: RouteRecordRaw[] = [
  {
    path: "/company-products",
    name: "company-product.index",
    component: CompanyProductListView,
    meta: {
      Title: "company_products",
      requiredAuth: true,
    },
  },
];
