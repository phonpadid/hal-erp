import type { RouteRecordRaw } from "vue-router";
import BankListView from "../views/bank/BankListView.vue";


export const banksRoutes: RouteRecordRaw[] = [
  {
    path: "/bank",
    name: "BankList",
    component: BankListView,
    meta: {
      Title: "banks",
      requiredAuth: true,
    },
  },
];
