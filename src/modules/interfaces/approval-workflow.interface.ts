import type { ApprovalWorkflowStepApiModel } from "./approval-workflow-step.interface";
import type { DoucmentTypeInterface } from "./documenet-type.interface";

export interface ApprovalWorkflowApiModel {
  id: number;
  name: string;
  documentTypeId: number;
  document_type?: DoucmentTypeInterface,
  steps?: ApprovalWorkflowStepApiModel[]
  created_at?: string;
  updated_at?: string;
}
