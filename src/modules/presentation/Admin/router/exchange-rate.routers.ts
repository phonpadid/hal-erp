import type { RouteRecordRaw } from "vue-router";
import ExchangeRateView from "../views/exchange-rates/ExchangeRateView.vue";

export const exchangeRateRoutes: RouteRecordRaw[] = [
  {
    path: "/exchange-rates",
    name: "exchange-rate.index",
    component: ExchangeRateView,
    meta: {
      title: "exchange-rate",
      requiredAuth: true,
    },
  },
];
