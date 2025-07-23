import type { DocumentTypeDTO } from "./documenet-type.dto";

export interface CreateApprovalWorkflowDTO {
  name: string;
  document_type_id: string;
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
