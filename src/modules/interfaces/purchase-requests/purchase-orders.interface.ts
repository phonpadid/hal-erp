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
