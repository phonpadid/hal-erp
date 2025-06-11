import type { RouteRecordRaw } from "vue-router";
import UserListViews from "../views/user/UserList.vue";
import UserForm from "../components/user/UserForm.vue";
// import ManageUserForm from "../components/user/ManageUserForm.vue";
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
    props: { isEditMode: false },
    meta: {
      title: "Add User",
      requiredAuth: true,
    },
  },
  {
    path: "/users/edit/:id",
    name: "UserEdit",

    component: UserForm,
    props: (route) => ({
      isEditMode: true,
      user: route.params.user,
    }),
    meta: {
      title: "Edit User",
      requiredAuth: true,
    },
  },
];
