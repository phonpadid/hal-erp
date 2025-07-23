import type { RouteRecordRaw } from "vue-router";
import DirectorList from "../views/director/views/DirectorList.vue";
import FormDetails from "../components/director/FormDetails.vue";
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
  {
    path: "/director/detail/:id",
    name: "director-detail",
    component: FormDetails,
    meta: {
      title: "Director Detail",
      requiredAuth: true,
    },
  },
];
