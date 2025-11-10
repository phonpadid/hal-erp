import type { RouteRecordRaw } from "vue-router";
import HalGroupListView from "../views/hal-group/HalGroupListView.vue";

const halGroupRoutes: RouteRecordRaw[] = [
  {
    path: "/hal-groups",
    name: "hal-group.index",
    component: HalGroupListView,
    meta: { Title: "hal-groups", requiredAuth: true },
  },
  {
    path: "/hal-groups/overview",
    name: "hal-group.overview",
    component: () => import("../components/hal-group/overView/OverView.vue"),
    meta: { Title: "hal-group-overview", requiredAuth: true },
  },
  {
    path: "/hal-groups/create",
    name: "hal-group.create",
    component: () => import("../views/hal-group/HalGroupCreateView.vue"),
    meta: { Title: "hal-group-create", requiredAuth: true },
  },
  {
    path: "/hal-groups/edit/:id",
    name: "hal-group.edit",
    component: () => import("../views/hal-group/HalGroupEditView.vue"),
    meta: { Title: "hal-group-edit", requiredAuth: true },
  },
  {
    path: "/hal-groups/company/:id",
    name: "hal-group.company.detail",
    component: () => import("../components/hal-group/company-detail/CompanyDetail.vue"),
    meta: { Title: "hal-group-company-detail", requiredAuth: true },
  },
];

export { halGroupRoutes };