export interface VendorInterface {
  id: string;
  name: string;
  contact_info: string;
  vendor_bank_account: {
    currency_id: number;
    bank_id: number;
    account_name: string;
    account_number: string;
  }[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
export interface VendorCreateInteface {
  name: string;
  contact_info: string;
}
export interface VendorUpdateIntrface {
  name?: string;
  contact_info?: string;
}
