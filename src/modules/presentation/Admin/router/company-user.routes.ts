import type { RouteRecordRaw } from "vue-router";
import CompanyUserList from "../views/company-user/CompanyUserList.vue";
import CompanyUserCreateView from "../views/company-user/CompanyUserCreateView.vue";
import CompanyUserEditView from "../views/company-user/CompanyUserEditView.vue";

export const companyUserRoutes: RouteRecordRaw[] = [
  {
    path: "/companies/users",
    name: "company-user.index",
    component: CompanyUserList,
    meta: {
      Title: "company-users",
      requiredAuth: true,
    },
  },
  {
    path: "/companies/users/create",
    name: "company-user.create",
    component: CompanyUserCreateView,
    meta: {
      Title: "create-company-user",
      requiredAuth: true,
    },
  },
  {
    path: "/companies/users/edit/:id",
    name: "company-user.edit",
    component: CompanyUserEditView,
    meta: {
      Title: "edit-company-user",
      requiredAuth: true,
    },
  },
];