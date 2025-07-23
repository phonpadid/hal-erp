export interface UserApprovalApiModel {
  id: number;
  status_id?: string;
  document_id?: string;
  approval_workflow_id?: string;

  doc_title?: string;
  approval_workflow_name?: string;
  status_name?: string;
  created_at?: string;
  updated_at?: string;
}
