import type { ApprovalWorkflowApiModel } from "./approval-workflow.interface";
import type { DepartmentApiModel } from "./departments/department.interface";

export interface ApprovalWorkflowStepApiModel {
  id: number;
  approval_workflow_id: number;
  departmentId: number;
  step_name: string;
  step_number: number;
  approval_workflow?: ApprovalWorkflowApiModel
  department?: DepartmentApiModel
  created_at?: string;
  updated_at?: string;
}
