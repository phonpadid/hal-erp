import type { RouteRecordRaw } from "vue-router";
import VendorView from "../../views/vendors/vendor/VendorView.vue";
import VendorDetailView from "../../views/vendors/vendor_product/VendorDetailView.vue";

export const vendorsRoutes: RouteRecordRaw[] = [
  {
    path: "/vendors",
    name: "vendors.index",
    component: VendorView,
    meta: {
      Title: "vendors",
      requiredAuth: true,
    },
  },
  {
    path: "/vendors/:id",
    name: "vendors.detail",
    component: VendorDetailView,
    meta: {
      Title: "vendorProduct.detail.title",
      requiredAuth: true,
    },
  },
];
