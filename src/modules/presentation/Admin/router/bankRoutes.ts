import type { RouteRecordRaw } from "vue-router";
import BankListView from "../views/bank/BankListView.vue";


export const banksRoutes: RouteRecordRaw[] = [
  {
    path: "/banks",
    name: "bank.index",
    component: BankListView,
    meta: {
      Title: "banks",
      requiredAuth: true,
    },
  },
];
