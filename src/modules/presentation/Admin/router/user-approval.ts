import type { RouteRecordRaw } from "vue-router";
import DepartmentView from "../views/user-approvals/UserApprovalView.vue";
export const userApprovalRoutes: RouteRecordRaw[] = [
  {
    path: "/user-approvals",
    name: "user_approval.index",
    component: DepartmentView,
    meta: {
      title: "User approval",
      requiredAuth: true,
    },
  },
];
