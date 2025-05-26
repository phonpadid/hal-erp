import type { RouteRecordRaw } from "vue-router";
import UserListViews from "../views/user/UserList.vue";
import UserForm from "../components/user/UserForm.vue";

export const userRoutes: RouteRecordRaw[] = [
  {
    path: "/users",
    name: "userList",
    component: UserListViews,
    meta: {
      title: "Users",
      requiredAuth: true,
    },
  },
  {
    path: "/users/add",
    name: "UserAdd",
    component: UserForm,
    meta: {
      title: "Add User",
      requiredAuth: true,
    },
  },
  {
    path: "/users/edit/:id",
    name: "UserEdit",

    component: UserForm,
    meta: {
      title: "Edit User",
      requiredAuth: true,
    },
  },
];
