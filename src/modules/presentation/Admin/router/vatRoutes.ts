import type { RouteRecordRaw } from "vue-router";
import VatListView from "../views/vat/VatListView.vue";

export const vatRoutes: RouteRecordRaw[] = [
  {
    path: "/vats",
    name: "vat.index",
    component: VatListView,
    meta: {
      Title: "vats",
      requiredAuth: true,
    },
  },
];
