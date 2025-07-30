export interface PurchaseRequestItemDTO {
  title: string;
  file_name: string;
  quantity: number;
  unit_id: number;
  price: number;
  remark?: string;
}

interface DocumentDTO {
  description: string;
  documentTypeId: number;
}

export interface CreatePurchaseRequestDTO {
  expired_date: string;
  purposes: string;
  document: DocumentDTO;
  purchase_request_items: PurchaseRequestItemDTO[];
}

export interface UpdatePurchaseRequestDTO {

  expired_date: string;
  purposes: string;
  document: DocumentDTO;
  purchase_request_items?: PurchaseRequestItemDTO[];
}

export interface PurchaseRequestResponseDTO {
  id: string;
  pr_number: string | null;
  expired_date: string;
  purposes: string;
  document: DocumentDTO;
  purchase_request_items: PurchaseRequestItemDTO[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
