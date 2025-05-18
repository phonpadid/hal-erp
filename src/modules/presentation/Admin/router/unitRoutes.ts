import type { RouteRecordRaw } from "vue-router";
import UnitListView from "../views/unit/UnitListView.vue";
import UniteCreate from "../views/unit/UniteCreate.vue";
import UnitUpdate from "../views/unit/UnitUpdate.vue";

export const unitRoutes: RouteRecordRaw[] = [
  {
    path: "/units",
    name: "UnitList",
    component: UnitListView,
    meta: {
      title: "Units",
      requiredAuth: true,
    },
  },
  {
    path: "/units/create",
    name: "UnitCreate",
    component: UniteCreate,
    meta: {
      title: "Create Unit",
      requiredAuth: true,
    },
  },
  {
    path: "/units/:id/edit",
    name: "UnitEdit",
    component: UnitUpdate,
    props: true,
    meta: {
      title: "Edit Unit",
      requiredAuth: true,
    },
  },
];

