export interface VendorBankAccountInterface {
  id: string;
  vendor_id: string;
  currency_id: string | number;
  bank_id: string | number;
  account_name: string;
  account_number: string;
  is_selected: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreateVendorBankAccountInterface {
  vendor_id: string | number;
  currency_id: string | number;
  bank_id: string | number;
  account_name: string;
  account_number: string;
  is_selected?: boolean;
}
export interface UpdateVendorBankAccountInterface {
  vendor_id?: number | string;
  currency_id?: number | string;
  bank_id?: number | string;
  account_name?: string;
  account_number?: string;
  is_selected?: boolean;
}
