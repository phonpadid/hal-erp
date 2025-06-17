export interface CreatePurchaseRequestItemDTO {
  title: string;
  fileName?: string[] | null;
  quantity: number;
  unitId: string;
  price: number;
  totalPrice: number;
  remark?: string;
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
