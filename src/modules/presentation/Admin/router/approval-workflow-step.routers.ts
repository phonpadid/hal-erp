import type { RouteRecordRaw } from "vue-router";
import ApprovalWorkflowStepView from "../views/approval-workflow-steps/ApprovalWorkflowStepView.vue";

export const approvalWorkflowStepRoutes: RouteRecordRaw[] = [
  {
    path: "/approval-workflows-step",
    name: "approval_workflow_step.index",
    component: ApprovalWorkflowStepView,
    meta: {
      title: "Approval workflow steps",
      requiredAuth: true,
    },
  },
];
