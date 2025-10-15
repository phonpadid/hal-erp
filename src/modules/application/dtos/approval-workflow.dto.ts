import type { DocumentTypeDTO } from "./documenet-type.dto";

export interface CreateApprovalWorkflowDTO {
  name: string;
  document_type_id: string;
  steps: {
    id?: string;
    approval_workflow_id?: string
    department_id: string
    step_name: string
    step_number: number
    type: string
    user_id: string
    requires_file: string,
    is_otp: string,
  }[]
}

export interface UpdateApprovalWorkflowDTO {
  id: string;
  name: string;
  document_type_id: string;
}

export interface ApprovalWorkflowDTO {
  id: string;
  document_type_id: string;
  name: string;
  document_types: DocumentTypeDTO | null
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApprovalStatusDto {
  status: string;
}
