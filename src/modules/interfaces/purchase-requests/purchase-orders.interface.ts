/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PurchaseOrderinterface {
  purchase_request_id: number;
  document: DocumentInterface;
  items: ItemInterface[];
}
export interface DocumentInterface {
  description: string;
  documentTypeId: number;
}
export interface ItemInterface {
  purchase_request_item_id: number;
  price: number;
  is_vat: boolean;
  selected_vendor: VendorInterface[];
}
export interface VendorInterface {
  vendor_id: number;
  vendor_bank_account_id: number;
  filename: string;
  reason: string;
  selected: boolean;
}

export interface PurchaseOrderVendorApiModel {
  vendor_id: number;
  vendor_bank_account_id: number | null;
  filename: string | null;
  reason: string | null;
  selected: boolean;
  created_by?: string;
  created_at?: string;
}

export interface PurchaseOrderItemApiModel {
  id?: number;
  purchase_request_item_id: number;
  price: number;
  is_vat: boolean;
  selected_vendor: PurchaseOrderVendorApiModel[];
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface PurchaseOrderApiModel {
  purchase_order_item: Array<{
    id: number;
    purchase_order_id: number;
    purchase_request_item_id: number;
    budget_item_id: number;
    remark: string;
    quantity: number;
    price: number;
    total: number;
    vat_total: number;
    total_with_vat: number;
    is_vat: boolean;
    selected_vendor: Array<{
      id: number;
      purchase_order_item_id: number;
      vendor_id: number;
      vendor_bank_account_id: number;
      filename: string;
      reason: string;
      selected: boolean;
      vendor: {
        id: number;
        name: string;
        contact_info: string;
      };
    }>;
  }>;
  id?: number;
  po_number?: string;
  purchase_request_id: number;
  document: {
    id?: number;
    description: string | null;
    documentTypeId: number;
    department?: string;
    requester?: string;
    position?: Array<{
      id: number;
      name: string;
      created_at: string;
      updated_at: string;
    }>;
    created_by?: string;
    created_at?: string;
    updated_by?: string;
    updated_at?: string;
  };
  purchase_request?: any;
 user_approval?: {
    id: number;
    document_id: number;
    status_id: number;
    approval_step: Array<{
      id: number;
      user_approval_id: number;
      step_number: number;
      approver_id: number;
      status_id: number;
      remark: string;
    }>;
    document_status: {
      id: number;
      name: string;
    };
  };
  items: PurchaseOrderItemApiModel[];
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Product {
  key: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  remark: string;
}

export interface FormStateInterface {
  documentId: string;
  date: Date | null;
  name: string;
  quantity: string;
  summary: string;
  sumTotal: string;
  totalName: string;
  price: string;
  total_price: string;
  invoiceType: string;
  descriptions: string;
  purposes: string;
  title: string;
  products: Product[];
  bank: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currencyCode: string;
  vendorImage: string;
  vendorType: string;
  vendorId: string;
}

export interface PurchaseItem {
  id: string | number | null;
  title: string;
  quantity: number;
  unit: any;
  price: number;
  total_price: number;
  remark: string | null;
  file_name_url: string | null;
}
