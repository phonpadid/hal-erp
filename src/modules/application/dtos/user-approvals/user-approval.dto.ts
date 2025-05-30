export interface CreateUserApprovalDTO {
  document_id: string;
  approval_workflow_id: string;
  status_id: string;
}

export interface UpdateUserApprovalDTO {
  id: string;
  document_id: string;
  approval_workflow_id: string;
  status_id: string;
}

export interface UserApprovalDTO {
  id: string;
  document_id: string;
  approval_workflow_id: string;
  status_id: string;

  doc_title: string | null
  status_name: string | null
  approval_workflow_name: string | null

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
