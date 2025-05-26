import type { RouteRecordRaw } from "vue-router";
import CategoryListView from "../views/category/CategoryListView.vue";

export const categoryRoutes: RouteRecordRaw[] = [
  {
    path: "/categories",
    name: "CategoryList",
    component: CategoryListView,
    meta: {
      Title: "categories",
      requiredAuth: true,
    },
  },
];
