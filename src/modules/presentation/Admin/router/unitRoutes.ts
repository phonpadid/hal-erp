import type { RouteRecordRaw } from "vue-router";
import UnitListView from "../views/unit/UnitListView.vue";

export const unitRoutes: RouteRecordRaw[] = [
  {
    path: "/units",
    name: "unit.index",
    component: UnitListView,
    meta: {
      title: "Units",
      requiredAuth: true,
    },
  },
];
