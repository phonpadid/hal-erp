import type { RouteRecordRaw } from "vue-router";
import CurrencyView from "../views/currencies/CurrencyView.vue";

export const currencyRoutes: RouteRecordRaw[] = [
  {
    path: "/currencies",
    name: "currencies.index",
    component: CurrencyView,
    meta: {
      title: "Department",
      requiredAuth: true,
    },
  },
];
