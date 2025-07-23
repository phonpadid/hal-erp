import type { CreatePurchaseRequestItemDTO } from "./purchase-request-item.dto";

export interface CreatePurchaseRequestDTO {
  documentTypeId: string;
  requestedDate: string;
  expiredDate: string;
  purposes: string;
  purchaseItem: CreatePurchaseRequestItemDTO[];
}

export interface UpdatePurchaseRequestDTO {
  id: string;
  title: string;
}

export interface PurchaseRequestDTO {
  id: string;
  document_type_id: string;
  status_id: string;

  doc_title: string | null
  status_name: string | null
  approval_workflow_name: string | null

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
