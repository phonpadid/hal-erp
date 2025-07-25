import type { RouteRecordRaw } from "vue-router";
import VendorView from "../../views/vendors/vendor/VendorView.vue";

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
];
