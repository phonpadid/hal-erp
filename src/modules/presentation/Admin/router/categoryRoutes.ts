import type { RouteRecordRaw } from "vue-router";
import CategoryListView from "../views/category/CategoryListView.vue";

export const categoryRoutes: RouteRecordRaw[] = [
  {
    path: "/categories",
    name: "category.index",
    component: CategoryListView,
    meta: {
      Title: "categories",
      requiredAuth: true,
    },
  },
];
