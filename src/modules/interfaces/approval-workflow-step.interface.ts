import type { ApprovalWorkflowApiModel } from "./approval-workflow.interface";
import type { DepartmentApiModel } from "./departments/department.interface";
import type { UserInterface } from "./user.interface";

export interface ApprovalWorkflowStepApiModel {
  id?: string;
  approval_workflow_id: number;
  departmentId: number;
  step_name: string;
  step_number: number;
  userId: number;
  type: string;
  requires_file: boolean;
  is_otp: boolean;
  approval_workflow?: ApprovalWorkflowApiModel;
  user?: UserInterface;
  department?: DepartmentApiModel
  created_at?: string;
  updated_at?: string;
}
export interface IApprovalWorkflowStepApiModel {
  id: number;
  approval_workflow_id: number;
  departmentId: number;
  step_name: string;
  step_number: number;
  user_id: number;
  type: string;
  requires_file: boolean;
  is_otp: boolean;
  approval_workflow?: ApprovalWorkflowApiModel;
  user?: UserInterface;
  department?: DepartmentApiModel
  created_at?: string;
  updated_at?: string;
}
