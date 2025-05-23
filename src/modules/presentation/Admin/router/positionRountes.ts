import type { RouteRecordRaw } from "vue-router";
import PositionListView from "../views/position/PositionListView.vue";

export const positionRoutes: RouteRecordRaw[] = [
  {
    path: "/positions",
    name: "PositionList",
    component: PositionListView,
    meta: {
      Title: "positions",
      requiredAuth: true,
    },
  },
];
