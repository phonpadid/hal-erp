import type { RouteRecordRaw } from "vue-router";
import DirectorList from "../views/director/views/DirectorList.vue";
export const directorRoutes: RouteRecordRaw[] = [
  {
    path: "/director",
    name: "director-list",
    component: DirectorList,
    meta: {
      title: "Director List",
      requiredAuth: true,
    },
  },
];
