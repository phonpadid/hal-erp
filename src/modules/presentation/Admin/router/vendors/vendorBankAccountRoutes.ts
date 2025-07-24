import type { RouteRecordRaw } from "vue-router";
import VendorBankView from "../../views/vendors/vendor_bank_accounts/VendorBank.vue";

export const vendorsBanksRoutes: RouteRecordRaw[] = [
  {
    path: "/vendors-bank/:id",
    name: "vendors.bank.index",
    component: VendorBankView,
    meta: {
      Title: "vendorsBank",
      requiredAuth: true,
    },
  },
];
