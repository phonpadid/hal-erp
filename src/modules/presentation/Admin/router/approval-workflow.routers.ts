import type { RouteRecordRaw } from "vue-router";
import ApprovalWorkflowView from "../views/approval-workflows/ApprovalWorkflowView.vue";

export const approvalWorkflowRoutes: RouteRecordRaw[] = [
  {
    path: "/approval-workflows",
    name: "approval_workflows.index",
    component: ApprovalWorkflowView,
    meta: {
      title: "Approval workflows",
      requiredAuth: true,
    },
  },
];
