import type { ApprovalWorkflowDTO } from "./approval-workflow.dto";
import type { DepartmentDTO } from "./departments/department.dto";

export interface CreateApprovalWorkflowStepDTO {
  approval_workflow_id?: string;
  department_id: string;
  step_name: string;
  step_number: number;
  user_id: number;
  type: string;
  requires_file: string;
}

export interface UpdateApprovalWorkflowStepDTO {
  id: string;
  approval_workflow_id?: string;
  department_id: string;
  step_name: string;
  step_number: number;
  user_id: number;
  type: string;
  requires_file: string;
}

export interface ApprovalWorkflowStepDTO {
  id: string;
  step_name: string;
  step_number: number;
  approval_workflow: ApprovalWorkflowDTO;
  department: DepartmentDTO
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
