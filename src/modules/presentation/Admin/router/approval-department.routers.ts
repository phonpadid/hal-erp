import type { RouteRecordRaw } from "vue-router";
import ApprovalDepartmentList from "../views/approval-department/ApprovalDepartmentList.vue";
import ApprovalDepartmentDetails from "@/modules/presentation/Admin/components/approval-department/ApprovalDepartmentDetails.vue";

export const approvalDepartmentsRoutes: RouteRecordRaw[] = [
  {
    path: "/approval-department-panak",
    name: "approval_department_panak",
    component: ApprovalDepartmentList,
    meta: {
      title: "Approval Department Panak",
      requiredAuth: true,
    },
  },
  {
    path: "/approval-department-panak/:id",
    name: "approval_department_panak_detail",
    component: ApprovalDepartmentDetails,
    meta: {
      title: "Approval Department Detail Panak",
      requiredAuth: true,
    },
  },
];
