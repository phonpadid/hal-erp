/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CreatePurchaseOrderDTO {
  purchase_request_id: number;
  document: {
    description: string | null;
    documentTypeId: number;
    created_by: string;
    created_at: string;
    updated_by: string;
    updated_at: string;
  };
  items: Array<{
    purchase_request_item_id: number;
    price: number;
    is_vat: boolean;
    created_by: string;
    created_at: string;
    selected_vendor: Array<{
      vendor_id: number;
      vendor_bank_account_id: number | null;
      filename: string | null;
      reason: string | null;
      selected: boolean;
      created_by: string;
      created_at: string;
    }>;
  }>;
}

export interface UpdatePurchaseOrderDTO{
  id: number;
  purchase_request_id: number;
  document: {
    description: string | null;
    documentTypeId: number;
    created_by: string;
    created_at: string;
    updated_by: string;
    updated_at: string;
  };
  items: Array<{
    purchase_request_item_id: number;
    price: number;
    is_vat: boolean;
    created_by: string;
    created_at: string;
    selected_vendor: Array<{
      vendor_id: number;
      vendor_bank_account_id: number | null;
      filename: string | null;
      reason: string | null;
      selected: boolean;
      created_by: string;
      created_at: string;
    }>;
  }>;
}

export interface PurchaseOrderResponseDTO {
  status_code: number;
  message: string;
  data: any;
  total?: number;
}

export interface PurchaseOrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
