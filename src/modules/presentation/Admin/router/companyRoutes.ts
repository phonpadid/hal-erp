import type { RouteRecordRaw } from "vue-router";
import CompanyListView from "../views/company/CompanyListView.vue";
import CompanyCreateView from "../views/company/CompanyCreateView.vue";
import CompanyEditView from "../views/company/CompanyEditView.vue";

export const companyRoutes: RouteRecordRaw[] = [
  {
    path: "/companies",
    name: "company.index",
    component: CompanyListView,
    meta: {
      Title: "companies",
      requiredAuth: true,
    },
  },
  {
    path: "/companies/create",
    name: "company.create",
    component: CompanyCreateView,
    meta: {
      Title: "create-company",
      requiredAuth: true,
    },
  },
  {
    path: "/companies/edit/:id",
    name: "company.edit",
    component: CompanyEditView,
    meta: {
      Title: "edit-company",
      requiredAuth: true,
    },
  },
];