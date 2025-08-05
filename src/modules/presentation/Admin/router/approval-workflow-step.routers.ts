import type { RouteRecordRaw } from "vue-router";
import ApprovalWorkflowStepView from "../views/approval-workflow-steps/ApprovalWorkflowStepView.vue";
import ApprovalWorkflowStep from "../components/approval-workflows/ApprovalWorkflow.vue";

export const approvalWorkflowStepRoutes: RouteRecordRaw[] = [
  {
    path: "/approval-workflows-step/:id",
    name: "approval_workflow_step.index",
    component: ApprovalWorkflowStepView,
    meta: {
      title: "Approval workflow steps",
      requiredAuth: true,
    },
  },
  {
    path: "/create-approval-workflow/",
    name: "create-approval-workflow",
    component: ApprovalWorkflowStep,
    meta: {
      title: "Create Approval workflow steps",
      requiredAuth: true,
    },
  },
];
