import type { DoucmentTypeInterface } from "./documenet-type.interface";

export interface ApprovalWorkflowApiModel {
  id: number;
  name: string;
  document_type_id: number;
  document_types?: DoucmentTypeInterface
  created_at?: string;
  updated_at?: string;
}
