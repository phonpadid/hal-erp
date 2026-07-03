import type { RouteRecordRaw } from "vue-router";
import CompanyVendorListView from "../views/company-vendor/CompanyVendorListView.vue";

export const companyVendorRoutes: RouteRecordRaw[] = [
  {
    path: "/company-vendors",
    name: "company-vendor.index",
    component: CompanyVendorListView,
    meta: {
      Title: "company_vendors",
      requiredAuth: true,
    },
  },
];
